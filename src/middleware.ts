import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized({ req, token }) {
      // `/profile` requires authentication
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/profile/:path*"]
}; 