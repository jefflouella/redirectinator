import React from 'react';
import { ArrowLeft, Shield, Database, Eye, Lock, Users, Globe, Mail } from 'lucide-react';

interface PrivacyPageProps {
  onBack: () => void;
}

export const PrivacyPage: React.FC<PrivacyPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Shield className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
            <p className="text-gray-600">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> Redirectinator is a client-side application that processes your data locally in your browser. 
                We are committed to protecting your privacy and ensuring transparency about how your information is handled.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Database className="w-6 h-6 mr-2 text-blue-600" />
                1. Information We Collect
              </h2>
              <p className="text-gray-600 mb-4">
                Redirectinator is designed with privacy in mind. We collect minimal information to provide you with the best possible service:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">URLs You Submit</h4>
                  <p className="text-sm text-gray-600">
                    URLs you submit for redirect analysis are processed locally in your browser and are not stored on our servers.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Project Data</h4>
                  <p className="text-sm text-gray-600">
                    Your projects, analysis results, and settings are stored locally in your browser using IndexedDB.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Usage Analytics</h4>
                  <p className="text-sm text-gray-600">
                    Basic usage statistics to improve application performance and user experience.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Technical Information</h4>
                  <p className="text-sm text-gray-600">
                    Browser type, version, and device information for compatibility and support purposes.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 mr-2 text-green-600" />
                2. How We Use Your Information
              </h2>
              <p className="text-gray-600 mb-4">
                We use the information we collect solely to provide and improve the Redirectinator service:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li><strong>Service Provision:</strong> Process URL redirects and generate analysis reports</li>
                <li><strong>Performance Improvement:</strong> Optimize application speed and reliability</li>
                <li><strong>User Experience:</strong> Enhance features and functionality based on usage patterns</li>
                <li><strong>Technical Support:</strong> Provide assistance and troubleshoot issues</li>
                <li><strong>Security:</strong> Protect against abuse and ensure system integrity</li>
                <li><strong>Compatibility:</strong> Ensure the application works across different browsers and devices</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 mr-2 text-purple-600" />
                3. Data Storage and Security
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-green-800 mb-2">Local Storage (Primary)</h4>
                <p className="text-green-700 text-sm">
                  All your project data, including URLs and analysis results, are stored locally in your browser using IndexedDB. 
                  This data never leaves your device unless you explicitly export it.
                </p>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Server Processing (Temporary)</h4>
                <p className="text-yellow-700 text-sm">
                  When you submit URLs for analysis, they are sent to our backend server for processing. 
                  These requests are temporary and not stored permanently on our servers.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Security Measures</h4>
                <p className="text-blue-700 text-sm">
                  We implement industry-standard security measures including HTTPS encryption, secure headers, 
                  and regular security audits to protect your data during transmission and processing.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-orange-600" />
                4. Third-Party Services
              </h2>
              <p className="text-gray-600 mb-4">
                We may use the following third-party services to enhance the Redirectinator experience:
              </p>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Internet Archive Wayback Machine</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    Used for historical URL discovery and analysis. The Internet Archive has its own privacy policy 
                    which you can review at <a href="https://archive.org/about/terms.php" className="text-blue-600 hover:text-blue-700">archive.org/about/terms.php</a>.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Analytics Services</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    We may use analytics services to understand usage patterns and improve the application. 
                    These services collect anonymous usage data only.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Hosting Services</h4>
                  <p className="text-sm text-gray-600 mb-2">
                    We use reliable hosting services to provide consistent application availability. 
                    These services have their own privacy policies and security measures.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-600" />
                5. Your Rights and Choices
              </h2>
              <p className="text-gray-600 mb-4">
                You have complete control over your data and how it's used:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Data Access</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Export your project data at any time</li>
                    <li>• View all locally stored information</li>
                    <li>• Request information about data collection</li>
                  </ul>
                </div>
                <div className="bg-indigo-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-indigo-900 mb-2">Data Control</h4>
                  <ul className="text-sm text-indigo-700 space-y-1">
                    <li>• Delete local data by clearing browser storage</li>
                    <li>• Opt out of analytics (if applicable)</li>
                    <li>• Control what information is processed</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Cookies and Tracking</h2>
              <p className="text-gray-600 mb-4">
                Redirectinator uses minimal cookies and tracking technologies:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Essential Cookies</p>
                    <p className="text-sm text-gray-600">Required for application functionality and cannot be disabled</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Analytics Cookies</p>
                    <p className="text-sm text-gray-600">Optional cookies to understand usage patterns and improve the service</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">No Advertising Cookies</p>
                    <p className="text-sm text-gray-600">We do not use tracking for advertising purposes</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Children's Privacy</h2>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  <strong>Important:</strong> Redirectinator is not intended for use by children under 13 years of age. 
                  We do not knowingly collect personal information from children under 13. If you are a parent or guardian 
                  and believe your child has provided us with personal information, please contact us immediately.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-600">
                Redirectinator is operated from the United States. If you are accessing the service from outside the United States, 
                please be aware that your information may be transferred to, stored, and processed in the United States where our 
                servers are located and our central database is operated. By using our service, you consent to the transfer of your 
                information to the United States.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to This Policy</h2>
              <p className="text-gray-600 mb-4">
                We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, 
                legal, or regulatory reasons. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Posting the new Privacy Policy on this page</li>
                <li>Updating the "Last updated" date at the top of this policy</li>
                <li>Providing notice through the application interface if significant changes occur</li>
              </ul>
              <p className="text-gray-600 mt-4">
                Your continued use of Redirectinator after any changes to this Privacy Policy constitutes acceptance of the updated policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                10. Contact Us
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, 
                please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Email:</strong> privacy@redirectinator.com</li>
                      <li><strong>Website:</strong> <a href="https://www.jefflouella.com" className="text-blue-600 hover:text-blue-700">https://www.jefflouella.com</a></li>
                      <li><strong>Creator:</strong> Jeff Louella</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                    <p className="text-sm text-gray-600">
                      We aim to respond to all privacy-related inquiries within 48 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-blue-800 text-sm text-center">
                <strong>Thank you for trusting Redirectinator with your data.</strong><br />
                We are committed to protecting your privacy and providing transparency about our data practices.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
