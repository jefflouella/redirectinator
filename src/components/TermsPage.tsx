import React from 'react';
import { ArrowLeft, FileText, Shield, Users, Globe, AlertTriangle, Scale, Mail, CheckCircle, XCircle } from 'lucide-react';

interface TermsPageProps {
  onBack: () => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onBack }) => {
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
              <FileText className="w-12 h-12 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms & Conditions</h1>
            <p className="text-gray-600">
              <strong>Last updated:</strong> {new Date().toLocaleDateString()}
            </p>
          </div>
          
          <div className="prose prose-gray max-w-none">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> By accessing and using Redirectinator, you accept and agree to be bound by these Terms & Conditions. 
                If you do not agree to these terms, please do not use this service.
              </p>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <CheckCircle className="w-6 h-6 mr-2 text-green-600" />
                1. Acceptance of Terms
              </h2>
              <p className="text-gray-600 mb-4">
                These Terms & Conditions ("Terms") constitute a legally binding agreement between you and Jeff Louella 
                ("we," "us," or "our") regarding your use of Redirectinator ("the Service").
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  <strong>By using Redirectinator, you:</strong>
                </p>
                <ul className="text-green-700 text-sm mt-2 space-y-1">
                  <li>• Accept and agree to be bound by these Terms</li>
                  <li>• Confirm that you are at least 13 years of age</li>
                  <li>• Have the legal capacity to enter into this agreement</li>
                  <li>• Will comply with all applicable laws and regulations</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 mr-2 text-blue-600" />
                2. Description of Service
              </h2>
              <p className="text-gray-600 mb-4">
                Redirectinator is a professional URL redirect checker and monitoring tool designed for SEO professionals 
                and technical marketers. The Service provides:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Bulk URL Analysis</h4>
                  <p className="text-sm text-gray-600">
                    Process hundreds of URLs simultaneously with intelligent batching and progress tracking.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Historical Discovery</h4>
                  <p className="text-sm text-gray-600">
                    Discover historical URLs via Internet Archive integration for comprehensive analysis.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Export Capabilities</h4>
                  <p className="text-sm text-gray-600">
                    Export results in multiple formats including CSV, JSON, Excel, and detailed reports.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-2">Project Management</h4>
                  <p className="text-sm text-gray-600">
                    Organize and manage multiple projects with collaboration features and team sharing.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 mr-2 text-purple-600" />
                3. Use License and Restrictions
              </h2>
              <p className="text-gray-600 mb-4">
                We grant you a limited, non-exclusive, non-transferable, and revocable license to use Redirectinator 
                for its intended purpose, subject to these Terms.
              </p>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-red-800 mb-2">Prohibited Activities</h4>
                <p className="text-red-700 text-sm mb-2">You may NOT:</p>
                <ul className="text-red-700 text-sm space-y-1">
                  <li>• Use the Service for any unlawful purpose or to solicit unlawful acts</li>
                  <li>• Violate any international, federal, state, or local regulations</li>
                  <li>• Infringe upon our intellectual property rights or those of others</li>
                  <li>• Harass, abuse, defame, or discriminate against others</li>
                  <li>• Submit false or misleading information</li>
                  <li>• Upload viruses or malicious code</li>
                  <li>• Collect personal information of others without consent</li>
                  <li>• Attempt to reverse engineer or copy the Service</li>
                  <li>• Use the Service for commercial purposes without permission</li>
                  <li>• Overload or disrupt the Service or its servers</li>
                </ul>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Permitted Uses</h4>
                <p className="text-green-700 text-sm mb-2">You MAY:</p>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Use the Service for personal and professional SEO analysis</li>
                  <li>• Export and share your own analysis results</li>
                  <li>• Use the Service for legitimate business purposes</li>
                  <li>• Provide feedback and suggestions for improvement</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 mr-2 text-indigo-600" />
                4. User Responsibilities
              </h2>
              <p className="text-gray-600 mb-4">
                As a user of Redirectinator, you are responsible for:
              </p>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Account Security</h4>
                  <p className="text-sm text-gray-600">
                    Maintaining the security of your local data and ensuring your browser and device are properly secured.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Data Accuracy</h4>
                  <p className="text-sm text-gray-600">
                    Ensuring that URLs you submit for analysis are legitimate and you have permission to analyze them.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Compliance</h4>
                  <p className="text-sm text-gray-600">
                    Complying with all applicable laws, regulations, and these Terms when using the Service.
                  </p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Respectful Use</h4>
                  <p className="text-sm text-gray-600">
                    Using the Service in a manner that respects the rights of others and does not harm the Service or its users.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-6 h-6 mr-2 text-orange-600" />
                5. Intellectual Property Rights
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">Our Rights</h4>
                <p className="text-blue-700 text-sm">
                  Redirectinator and its original content, features, and functionality are owned by Jeff Louella and are 
                  protected by copyright, trademark, and other intellectual property laws. All rights not expressly granted 
                  are reserved.
                </p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-2">Your Rights</h4>
                <p className="text-green-700 text-sm">
                  You retain ownership of any content you create using the Service, including analysis results and exported data. 
                  You grant us a limited license to use feedback and suggestions for improving the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2 text-yellow-600" />
                6. Disclaimers and Limitations
              </h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Service Availability</h4>
                  <p className="text-yellow-700 text-sm">
                    The Service is provided "as is" and "as available." We do not guarantee uninterrupted or error-free operation. 
                    We may modify, suspend, or discontinue the Service at any time without notice.
                  </p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Limitation of Liability</h4>
                  <p className="text-red-700 text-sm">
                    In no event shall Jeff Louella be liable for any indirect, incidental, special, consequential, or punitive 
                    damages, including but not limited to loss of profits, data, or use, arising out of or relating to your use 
                    of the Service.
                  </p>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Accuracy Disclaimer</h4>
                  <p className="text-gray-700 text-sm">
                    While we strive for accuracy, we do not warrant that the Service will be error-free or that results will be 
                    completely accurate. You should verify all analysis results independently.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Data and Privacy</h2>
              <p className="text-gray-600 mb-4">
                Your privacy is important to us. Our collection and use of your information is governed by our Privacy Policy, 
                which is incorporated into these Terms by reference.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">
                  <strong>Key Points:</strong>
                </p>
                <ul className="text-blue-700 text-sm mt-2 space-y-1">
                  <li>• All data processing occurs locally in your browser</li>
                  <li>• We do not store your URLs or analysis results permanently</li>
                  <li>• You have complete control over your local data</li>
                  <li>• We implement industry-standard security measures</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Services and Links</h2>
              <p className="text-gray-600 mb-4">
                Redirectinator may integrate with or link to third-party services:
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Internet Archive</p>
                    <p className="text-sm text-gray-600">For historical URL discovery and analysis</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">Hosting Services</p>
                    <p className="text-sm text-gray-600">For reliable application hosting and availability</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <div>
                    <p className="font-medium text-gray-900">External Links</p>
                    <p className="text-sm text-gray-600">Links to external resources are provided for convenience only</p>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mt-4">
                We are not responsible for the content, privacy policies, or practices of any third-party services. 
                Use of third-party services is at your own risk.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Termination</h2>
              <p className="text-gray-600 mb-4">
                We may terminate or suspend your access to the Service immediately, without prior notice, for any reason, 
                including if you breach these Terms.
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-700 text-sm">
                  <strong>Upon termination:</strong>
                </p>
                <ul className="text-gray-600 text-sm mt-2 space-y-1">
                  <li>• Your right to use the Service will cease immediately</li>
                  <li>• You should export any data you wish to keep</li>
                  <li>• Local data may be cleared from your browser</li>
                  <li>• All provisions of these Terms that should survive termination will remain in effect</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Governing Law and Disputes</h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-2">Governing Law</h4>
                <p className="text-blue-700 text-sm mb-4">
                  These Terms are governed by and construed in accordance with the laws of the United States, 
                  without regard to conflict of law principles.
                </p>
                <h4 className="font-semibold text-blue-800 mb-2">Dispute Resolution</h4>
                <p className="text-blue-700 text-sm">
                  Any disputes arising from these Terms or your use of the Service will be resolved through 
                  binding arbitration in accordance with the rules of the American Arbitration Association.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to Terms</h2>
              <p className="text-gray-600 mb-4">
                We reserve the right to modify these Terms at any time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Posting the updated Terms on this page</li>
                <li>Updating the "Last updated" date</li>
                <li>Providing notice through the Service interface</li>
                <li>Sending email notifications for significant changes</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
                <p className="text-yellow-800 text-sm">
                  <strong>Important:</strong> Your continued use of Redirectinator after any changes to these Terms 
                  constitutes acceptance of the updated Terms. If you do not agree to the new Terms, you should 
                  discontinue use of the Service.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 mr-2 text-blue-600" />
                12. Contact Information
              </h2>
              <p className="text-gray-600 mb-4">
                If you have any questions about these Terms & Conditions, please contact us:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Details</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li><strong>Email:</strong> terms@redirectinator.com</li>
                      <li><strong>Website:</strong> <a href="https://www.jefflouella.com" className="text-blue-600 hover:text-blue-700">https://www.jefflouella.com</a></li>
                      <li><strong>Creator:</strong> Jeff Louella</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Response Time</h4>
                    <p className="text-sm text-gray-600">
                      We aim to respond to all inquiries within 48 hours during business days.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
              <p className="text-blue-800 text-sm text-center">
                <strong>Thank you for using Redirectinator.</strong><br />
                By using our service, you agree to these Terms & Conditions and our commitment to providing 
                a professional, secure, and reliable URL analysis tool.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
