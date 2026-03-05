import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import { Link } from "react-router-dom";
import { Section, Body, BulletList } from "@/app/components/StaticPageComponents";

export function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Terms of Use</CardTitle>
          <p className="text-sm text-muted-foreground">
            For the Websites of the Mt. Diablo Amateur Radio Club (MDARC)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Body>
            By using our websites and services, you are a &ldquo;user&rdquo; and you accept
            and agree to these Terms of Use (ToU) as a legal contract between
            you and us, the Mt. Diablo Amateur Radio Club (MDARC). By
            interacting with our websites, or using our goods or services, you
            are agreeing to be subject to these ToU in their entirety, without
            modification. If you do not accept and agree to all provisions of
            these ToU, now or in the future, you may reject these ToU by
            immediately terminating all access and use of our sites and
            services, in which case any continuing access or use of our sites
            and service is unauthorized.
          </Body>
          <Body>
            These ToU grant you a limited, revocable, nonexclusive license to
            access and use our sites and services, in whole or in part,
            including but not limited to our intellectual property therein,
            solely in compliance with these ToU.
          </Body>

          <Separator />

          <Section title="Errors and Omissions">
            <Body>
              MDARC strives to ensure that all content on this website is
              accurate, understandable and in compliance with all applicable
              laws and regulations. However, we are not responsible for any
              inaccuracies, omissions or user misunderstandings of our content.
              Further, MDARC is not liable whatsoever for any misuse of this
              content by you or others.
            </Body>
          </Section>

          <Separator />

          <Section title="Copyright">
            <Body>
              The content of websites operated by MDARC are copyrighted by the
              Mt. Diablo Amateur Radio Club and we reserve all rights. The
              content may be viewed, copied, and/or downloaded for
              noncommercial personal use only. In no event may our content be
              sold, traded or otherwise used for personal or organizational
              gain. Should you choose to share our content with other
              individuals or groups, an attribution to us is required.
            </Body>
          </Section>

          <Separator />

          <Section title="Legal Compliance">
            <Body>
              You are required to comply with, and to ensure compliance with,
              all laws, ordinances and regulations applicable to your activities
              on our sites and services. You agree to comply with the laws,
              ordinances and regulations of the United States of America, the
              State of California, and the County of Contra Costa, as well as
              those of your nation, state or province, and locality.
            </Body>
          </Section>

          <Separator />

          <Section title="Limitation of Liability">
            <Body>
              MDARC cannot be held liable for your use of our websites or their
              content.
            </Body>
          </Section>

          <Separator />

          <Section title="Jurisdiction, Governing Law">
            <Body>
              Any and all claims, causes of action or disputes between you and
              MDARC arising out of, or related to, these Terms of Use, our
              sites and/or services or content accessed through our sites will
              be governed by the laws of the State of California, USA. Any such
              claims shall be filed only in courts located in the county of
              Contra Costa, California, USA.
            </Body>
          </Section>

          <Separator />

          <Section title="Children">
            <Body>
              There is no age limit to become an amateur radio operator (ham);
              and we believe our websites are appropriate for anyone who is, or
              is interested in becoming, a ham. Our websites have no content
              directed specifically to children under 13 years of age. We do
              not knowingly collect data relating to children through these
              websites. Children may only access these websites and the services
              of MDARC with parental consent.
            </Body>
          </Section>

          <Separator />

          <Section title="Discrimination">
            <Body>
              MDARC does not discriminate for or against anyone based on any
              special categories, including such details as your race or
              ethnicity, national origin, religious or philosophical beliefs,
              gender, sex life, sexual orientation, disability, political
              opinions, trade union membership, and information about your
              health, genetic and biometric data.
            </Body>
          </Section>

          <Separator />

          <Section title="Prohibited Uses">
            <Body>
              As a user of our websites, you are prohibited from:
            </Body>
            <div className="mt-2">
              <BulletList
                items={[
                  "Leasing, selling, sublicensing, transferring, or assigning any information, intellectual property, goods, or services provided on these sites.",
                  "Using the sites for any illegal purpose.",
                  "Gaining unauthorized access to MDARC's data or the data of other users.",
                  "Altering, modifying, adapting, reverse engineering, decompiling, disassembling, or hacking MDARC's intellectual property.",
                  "Altering, modifying, or creating another website to falsely imply that it is associated with any of MDARC's websites, events or activities.",
                  "Using or exporting the MDARC's information, products, or services in violation of U.S. export laws and regulations.",
                  "Violating anyone else's legal rights (for example, privacy rights) or any laws (for example, copyright laws) in our or your jurisdiction.",
                  "Using the websites or MDARC's services to transmit unlawful, threatening, harassing, racist, abusive, libelous, pornographic, vulgar, defamatory, obscene, indecent, or otherwise inappropriate content.",
                  "Breaching, or attempting to breach, the website's security systems.",
                  "Enabling or encouraging third parties to violate these Terms of Use.",
                ]}
              />
            </div>
          </Section>

          <Separator />

          <Section title="Privacy Policy">
            <Body>
              Our website privacy policy is available at{" "}
              <Link
                to="/privacy"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                /privacy
              </Link>
              .
            </Body>
          </Section>

          <Separator />

          <Section title="Severability">
            <Body>
              If any provision of these ToU is held or made invalid by a court
              decision, statute or rule, or shall be otherwise rendered invalid,
              the remainder of this Agreement shall not be affected thereby.
            </Body>
          </Section>

          <Separator />

          <Section title="ToU Violations">
            <Body>
              MDARC may revoke or restrict your access to its websites,
              products, or services in the event that you violate these Terms of
              Use or any applicable law, regulation or ordinance.
            </Body>
            <div className="mt-2">
              <Body>
                In the event that you violate any of these Terms of Use or
                applicable laws, you agree to indemnify MDARC for any losses,
                damages or costs we incur as a result. Furthermore, MDARC will
                not be held responsible for any claim involving the user.
              </Body>
            </div>
          </Section>

          <Separator />

          <Section title="ToU Revisions">
            <Body>
              We may post changes to these ToU at any time, and any such
              changes will be applicable to all subsequent access to, or use of,
              our sites and services.
            </Body>
          </Section>

          <Separator />

          <Section title="Contacting Us">
            <Body>
              If there are any questions regarding these Terms of Use, you may
              contact us using the following information:
            </Body>
            <div className="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <p>
                Mailing Address: MDARC, P.O. Box 23222, Pleasant Hill, CA 94523
              </p>
              <p>Phone: (925) 288-1730</p>
              <p>
                Email:{" "}
                <a
                  href="mailto:info@mdarc.org"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  info@mdarc.org
                </a>
              </p>
            </div>
          </Section>
        </CardContent>
      </Card>
    </div>
  );
}
