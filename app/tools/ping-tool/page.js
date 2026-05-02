import PingToolClient from "./PingToolClient";

export const metadata = {
  title: "Free Ping Tool - Test Server Response Time & Packet Loss",
  description: "Ping any domain or IP from our server and view response times, packet loss percentage, and TTL. Run bulk ping tests on multiple hosts via CSV upload.",
  keywords: ["ping tool", "ping test online", "check server response time", "packet loss checker", "ttl checker", "bulk ping test", "is server online"],
  openGraph: {
    title: "Free Ping Tool - Test Server Response Time & Packet Loss",
    description: "Ping any domain or IP and view response times, packet loss, and TTL. Supports bulk CSV ping tests.",
    type: "website",
  },
};

export default function PingToolPage() {
  return <PingToolClient />;
}
