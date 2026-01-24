
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/db";
import Requester from "@/models/Requester";
import Admin from "@/models/Admin";
import Donor from "@/models/Donor";

export const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                console.log("[Auth] Authorize call for:", credentials?.email);
                try {
                    await dbConnect();
                } catch (dbErr) {
                    console.error("[Auth] DB Connect failed in authorize:", dbErr);
                    return null;
                }

                if (!credentials?.email || !credentials?.password) return null;

                // Check Requester
                const requester = await Requester.findOne({ email: credentials.email });
                if (requester) {
                    console.log("[Auth] Found in Requester collection");
                    const isPasswordValid = await bcrypt.compare(credentials.password, requester.password);
                    if (isPasswordValid) return { id: requester._id, name: requester.name, email: requester.email, role: 'requester' };
                    console.log("[Auth] Requester password invalid. Continuing...");
                }

                // Check Donor
                const donor = await Donor.findOne({ email: credentials.email });
                if (donor) {
                    console.log("[Auth] Found in Donor collection");
                    const isPasswordValid = await bcrypt.compare(credentials.password, donor.password);
                    if (isPasswordValid) return { id: donor._id, name: donor.name, email: donor.email, role: 'donor' };
                    console.log("[Auth] Donor password invalid. Continuing...");
                }

                // Check Admin (Future proofing as requested)
                console.log("[Auth] Checking Admin collection for:", credentials.email);
                const admin = await Admin.findOne({ email: credentials.email });
                console.log("[Auth] Admin found:", admin ? "YES" : "NO");

                if (admin) {
                    console.log("[Auth] Verifying Admin password...");
                    const isAdminPassValid = await bcrypt.compare(credentials.password, admin.password);
                    console.log("[Auth] Admin password valid:", isAdminPassValid);
                    if (isAdminPassValid) return { id: admin._id, name: admin.name, email: admin.email, role: 'admin' };
                }

                return null;
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.role = user.role;
                token.id = user.id.toString();
            }
            if (trigger === "update" && session?.role) {
                token.role = session.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session?.user) {
                session.user.role = token.role;
                session.user.id = token.id;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET || "bloodlink-secret-key-123",
    debug: process.env.NODE_ENV !== 'production'
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
