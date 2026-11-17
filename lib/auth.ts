import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import prisma from "@/lib/db";
import { getCurrentParticipant, PARTICIPANT_SESSION_COOKIE } from "@/lib/participant-auth";

const SESSION_COOKIE_NAME = "tvc_admin_session";
const SESSION_EXPIRY_DAYS = 7;

// Default foundational admin identifiers
const DEFAULT_ADMIN_WHITELIST = [
  "admin@thevichaarcouncil.in",
  "admin@vichaarcouncil.org",
  "thevichaarcouncil@gmail.com",
  "yuveerchhatwani18@gmail.com",
  "chhatwaniyuveer@gmail.com",
  "founder@thevichaarcouncil.in",
  "yuveerji",
  "chhatwani",
  "yuveer"
];

/**
 * Returns the consolidated list of authorized admin emails and usernames.
 */
export async function getAdminWhitelist(): Promise<string[]> {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: "ADMIN_WHITELIST" }
    });

    if (setting && setting.value) {
      try {
        const parsed = JSON.parse(setting.value);
        if (Array.isArray(parsed)) {
          const list = Array.from(new Set([...DEFAULT_ADMIN_WHITELIST, ...parsed])).map((s) =>
            String(s).trim().toLowerCase()
          );
          return list;
        }
      } catch {
        const list = Array.from(
          new Set([...DEFAULT_ADMIN_WHITELIST, ...setting.value.split(",").map((s) => s.trim().toLowerCase())])
        );
        return list;
      }
    } else {
      // Seed default whitelist in site settings if not present
      await prisma.siteSetting.upsert({
        where: { key: "ADMIN_WHITELIST" },
        update: {},
        create: {
          key: "ADMIN_WHITELIST",
          value: JSON.stringify(DEFAULT_ADMIN_WHITELIST),
          description: "Authorized admin emails and usernames with clearance to access /admin"
        }
      });
    }

    return DEFAULT_ADMIN_WHITELIST.map((s) => s.toLowerCase());
  } catch (error) {
    console.error("Error reading admin whitelist:", error);
    return DEFAULT_ADMIN_WHITELIST.map((s) => s.toLowerCase());
  }
}

/**
 * Checks whether an email or username is authorized as an administrator.
 */
export async function isIdentifierAdmin(
  email?: string | null,
  username?: string | null
): Promise<boolean> {
  const cleanEmail = email ? email.trim().toLowerCase() : "";
  const cleanUsername = username ? username.trim().toLowerCase().replace(/^@+/, "") : "";

  const whitelist = await getAdminWhitelist();

  if (cleanEmail && whitelist.includes(cleanEmail)) return true;
  if (cleanUsername && whitelist.includes(cleanUsername)) return true;

  // Check AdminUser table
  if (cleanEmail) {
    const adminUser = await prisma.adminUser.findFirst({
      where: { email: cleanEmail, isActive: true }
    });
    if (adminUser) return true;
  }

  // Check ParticipantUser role
  if (cleanEmail || cleanUsername) {
    const participant = await prisma.participantUser.findFirst({
      where: {
        OR: [
          ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ...(cleanUsername ? [{ username: cleanUsername }] : [])
        ]
      }
    });

    if (
      participant &&
      (participant.role === "FOUNDER" ||
        participant.role === "ROOT" ||
        participant.role === "ADMIN" ||
        participant.role === "SUPER_ADMIN" ||
        participant.role === "SECRETARIAT")
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Adds an email or username to the Admin Whitelist.
 */
export async function addAdminToWhitelist(
  rawIdentifier: string,
  role: string = "ADMIN"
): Promise<{ success: boolean; message: string }> {
  const clean = rawIdentifier.trim().toLowerCase().replace(/^@+/, "");
  if (!clean) {
    return { success: false, message: "A valid email or username is required." };
  }

  const currentList = await getAdminWhitelist();
  if (!currentList.includes(clean)) {
    currentList.push(clean);
    await prisma.siteSetting.upsert({
      where: { key: "ADMIN_WHITELIST" },
      update: { value: JSON.stringify(currentList) },
      create: {
        key: "ADMIN_WHITELIST",
        value: JSON.stringify(currentList),
        description: "Authorized admin emails and usernames with clearance to access /admin"
      }
    });
  }

  // If a participant account exists with this email or username, promote their role
  const isEmail = clean.includes("@");
  const participant = await prisma.participantUser.findFirst({
    where: isEmail ? { email: clean } : { username: clean }
  });

  if (participant) {
    await prisma.participantUser.update({
      where: { id: participant.id },
      data: { role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN" }
    });
  }

  // If it's an email and AdminUser doesn't exist, create an AdminUser record
  if (isEmail) {
    const existingAdmin = await prisma.adminUser.findUnique({ where: { email: clean } });
    if (!existingAdmin) {
      const defaultHash = await bcrypt.hash("CouncilAdmin@2026!", 10);
      await prisma.adminUser.create({
        data: {
          email: clean,
          name: participant ? participant.fullName : "Council Secretariat Member",
          passwordHash: defaultHash,
          role: role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CONTENT_ADMIN",
          isActive: true
        }
      });
    } else if (!existingAdmin.isActive) {
      await prisma.adminUser.update({
        where: { id: existingAdmin.id },
        data: { isActive: true }
      });
    }
  }

  return { success: true, message: `Added ${clean} to authorized admin list.` };
}

/**
 * Removes an email or username from the Admin Whitelist.
 */
export async function removeAdminFromWhitelist(
  rawIdentifier: string
): Promise<{ success: boolean; message: string }> {
  const clean = rawIdentifier.trim().toLowerCase().replace(/^@+/, "");
  const currentList = await getAdminWhitelist();
  const filtered = currentList.filter((item) => item !== clean);

  await prisma.siteSetting.upsert({
    where: { key: "ADMIN_WHITELIST" },
    update: { value: JSON.stringify(filtered) },
    create: {
      key: "ADMIN_WHITELIST",
      value: JSON.stringify(filtered),
      description: "Authorized admin emails and usernames with clearance to access /admin"
    }
  });

  // Demote participant if found
  const isEmail = clean.includes("@");
  const participant = await prisma.participantUser.findFirst({
    where: isEmail ? { email: clean } : { username: clean }
  });

  if (participant && (participant.role === "ADMIN" || participant.role === "SUPER_ADMIN")) {
    await prisma.participantUser.update({
      where: { id: participant.id },
      data: { role: "PARTICIPANT" }
    });
  }

  return { success: true, message: `Removed ${clean} from authorized admin list.` };
}

export async function createAdminSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);

  await prisma.adminSession.create({
    data: {
      token,
      userId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt
  });

  return token;
}

export async function getCurrentAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
      return null;
    }

    const session = await prisma.adminSession.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!session || session.expiresAt < new Date()) {
      return null;
    }

    return session.user;
  } catch (error) {
    console.error("Error retrieving current admin:", error);
    return null;
  }
}

/**
 * Validates whether the currently connected user is authorized to access /admin.
 * Checks both adminSession and participantSession.
 * If authorized, returns an admin profile object. If not, returns null.
 */
export async function getAuthorizedAdmin() {
  try {
    // 1. Direct admin session check
    const admin = await getCurrentAdmin();
    if (admin && admin.isActive) {
      const isFounder =
        admin.role === "FOUNDER" ||
        admin.role === "ROOT" ||
        ["yuveerchhatwani18@gmail.com", "chhatwaniyuveer@gmail.com", "founder@thevichaarcouncil.in"].includes(admin.email?.toLowerCase() || "");

      return {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: isFounder ? "FOUNDER" : admin.role,
        department: (admin as any).department || "EXECUTIVE",
        isActive: true
      };
    }

    // 2. Participant session check
    const participant = await getCurrentParticipant();
    if (participant) {
      const isAllowed = await isIdentifierAdmin(participant.email, participant.username);
      if (isAllowed) {
        const isFounder =
          participant.role === "FOUNDER" ||
          participant.role === "ROOT" ||
          ["yuveerji", "chhatwani", "yuveer"].includes(participant.username?.toLowerCase() || "") ||
          ["yuveerchhatwani18@gmail.com", "chhatwaniyuveer@gmail.com", "founder@thevichaarcouncil.in"].includes(participant.email?.toLowerCase() || "");

        return {
          id: participant.id,
          name: participant.fullName,
          email: participant.email,
          username: participant.username,
          role: isFounder ? "FOUNDER" : participant.role === "PARTICIPANT" ? "SUPER_ADMIN" : participant.role,
          department: isFounder ? "EXECUTIVE" : "GENERAL",
          isActive: true
        };
      }
    }

    return null;
  } catch (error) {
    console.error("Error in getAuthorizedAdmin:", error);
    return null;
  }
}

/**
 * Validates whether the currently connected user has exclusive FOUNDER root clearance.
 */
export async function getAuthorizedFounder() {
  const admin = await getAuthorizedAdmin();
  if (!admin) return null;
  if (
    admin.role === "FOUNDER" ||
    admin.role === "ROOT" ||
    ["yuveerji", "chhatwani", "yuveer"].includes(admin.username?.toLowerCase() || "") ||
    ["yuveerchhatwani18@gmail.com", "chhatwaniyuveer@gmail.com", "founder@thevichaarcouncil.in"].includes(admin.email?.toLowerCase() || "")
  ) {
    return admin;
  }
  return null;
}

/**
 * Checks if an administrator's role allows access to a specific operational module.
 */
export function hasPermission(role: string, moduleSection: string): boolean {
  if (role === "FOUNDER" || role === "ROOT" || role === "SUPER_ADMIN") return true;

  switch (moduleSection) {
    case "workspace":
    case "settings":
      return true;
    case "people":
      return ["SUPER_ADMIN", "HR_ADMIN", "OPERATIONS_ADMIN"].includes(role);
    case "content":
      return ["SUPER_ADMIN", "CONTENT_ADMIN", "EDITOR"].includes(role);
    case "events":
      return ["SUPER_ADMIN", "EVENTS_ADMIN", "EVENT_MANAGER"].includes(role);
    case "community":
      return ["SUPER_ADMIN", "COMMUNITY_ADMIN", "MODERATOR"].includes(role);
    case "communications":
      return ["SUPER_ADMIN", "COMMUNICATIONS_ADMIN", "MEDIA_OFFICER"].includes(role);
    case "partnerships":
      return ["SUPER_ADMIN", "OUTREACH_ADMIN", "PARTNERSHIPS_OFFICER"].includes(role);
    case "finance":
      return ["SUPER_ADMIN", "FINANCE_ADMIN"].includes(role);
    case "analytics":
      return ["SUPER_ADMIN", "FINANCE_ADMIN", "EVENTS_ADMIN", "ANALYST"].includes(role);
    case "support":
      return ["SUPER_ADMIN", "SUPPORT_ADMIN", "COMMUNITY_ADMIN", "OPERATIONS_ADMIN"].includes(role);
    default:
      return false;
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({ where: { token } });
    cookieStore.delete(SESSION_COOKIE_NAME);
  }
}

/**
 * Verifies admin credentials by email or username and password.
 */
export async function verifyAdminCredentials(identifier: string, passwordPlain: string) {
  const clean = identifier.trim().toLowerCase().replace(/^@+/, "");

  // 1. Try finding in AdminUser table by email
  const adminUser = await prisma.adminUser.findUnique({
    where: { email: clean }
  });

  if (adminUser && adminUser.isActive) {
    const isValid = await bcrypt.compare(passwordPlain, adminUser.passwordHash);
    if (isValid) {
      await prisma.adminUser.update({
        where: { id: adminUser.id },
        data: { lastLoginAt: new Date() }
      });
      return adminUser;
    }
  }

  // 2. Try finding in ParticipantUser table by email or username
  const participant = await prisma.participantUser.findFirst({
    where: {
      OR: [{ email: clean }, { username: clean }]
    }
  });

  if (participant && participant.isActive) {
    const isAllowed = await isIdentifierAdmin(participant.email, participant.username);
    if (isAllowed) {
      const isValid = await bcrypt.compare(passwordPlain, participant.passwordHash);
      if (isValid) {
        // Ensure an AdminUser record exists for session binding
        let linkedAdmin = await prisma.adminUser.findUnique({
          where: { email: participant.email }
        });

        if (!linkedAdmin) {
          linkedAdmin = await prisma.adminUser.create({
            data: {
              email: participant.email,
              name: participant.fullName,
              passwordHash: participant.passwordHash,
              role: participant.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "CONTENT_ADMIN",
              isActive: true,
              lastLoginAt: new Date()
            }
          });
        } else {
          await prisma.adminUser.update({
            where: { id: linkedAdmin.id },
            data: { lastLoginAt: new Date(), isActive: true }
          });
        }

        return linkedAdmin;
      }
    }
  }

  return null;
}
