import PortScannerClient from "./PortScannerClient";

export const metadata = {
  title: "Free Port Scanner - Check Open Ports on Any Domain or IP",
  description: "Instantly check if common ports are open on any server, IP, or domain. Scan HTTP, HTTPS, FTP, SSH, MySQL, PostgreSQL, RDP, and more. Run bulk port scans via CSV.",
  keywords: ["port scanner", "check open ports", "is port 80 open", "free port checker", "network port scanner", "bulk port scanner", "server port check"],
  openGraph: {
    title: "Free Port Scanner - Check Open Ports on Any Domain or IP",
    description: "Instantly check if common ports are open on any server. Scan HTTP, HTTPS, SSH, MySQL, RDP, and more.",
    type: "website",
  },
};

export default function PortScannerPage() {
  return <PortScannerClient />;
}
