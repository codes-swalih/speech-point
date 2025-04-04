import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Create and export the handler using the authOptions
const handler = NextAuth(authOptions);

// Export the handler as GET and POST methods
export { handler as GET, handler as POST };