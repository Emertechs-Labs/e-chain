import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | Echain',
  description: 'Cookie policy for Echain - Blockchain Event Platform',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-cyan-400">Cookie Policy</h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 mb-6">
              Last updated: October 1, 2025
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">What Are Cookies</h2>
            <p className="text-slate-300 mb-6">
              Cookies are small text files that are stored on your computer or mobile device when you visit our website.
              They help us provide you with a better browsing experience by allowing us to remember your preferences.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">How We Use Cookies</h2>
            <p className="text-slate-300 mb-6">
              We use cookies to enhance your experience on our platform, including remembering your login status,
              preferences, and providing personalized content. We also use cookies for analytics and performance monitoring.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Types of Cookies We Use</h2>
            <ul className="text-slate-300 mb-6 list-disc list-inside">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website</li>
              <li><strong>Functional Cookies:</strong> Remember your preferences and settings</li>
              <li><strong>Marketing Cookies:</strong> Used to deliver relevant advertisements</li>
            </ul>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Managing Cookies</h2>
            <p className="text-slate-300 mb-6">
              You can control and manage cookies in various ways. Most web browsers allow you to control cookies
              through their settings preferences. However, limiting cookies may affect your experience on our website.
            </p>

            <h2 className="text-2xl font-semibold mb-4 text-cyan-300">Contact Information</h2>
            <p className="text-slate-300 mb-6">
              For questions about our Cookie Policy, please contact us at privacy@echain.events
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}