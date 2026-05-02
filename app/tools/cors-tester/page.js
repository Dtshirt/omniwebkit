import CorsTesterClient from "./CorsTesterClient";

export const metadata = {
  title: "Free CORS Tester - Test Cross-Origin Resource Sharing Headers Online",
  description: "Test if a URL returns correct CORS headers for a given origin. Inspect Access-Control-Allow-Origin, preflight OPTIONS responses, credentials, and method permissions instantly.",
  keywords: ["cors tester", "test cors headers online", "cors checker", "access-control-allow-origin checker", "cors debugger", "preflight options test", "cors error fix", "cors policy checker"],
  openGraph: {
    title: "Free CORS Tester - Test CORS Headers Online",
    description: "Check if your API supports cross-origin requests. Inspect preflight OPTIONS responses and all CORS headers.",
    type: "website",
  },
};

export default function CorsTesterPage() {
  return <CorsTesterClient />;
}
