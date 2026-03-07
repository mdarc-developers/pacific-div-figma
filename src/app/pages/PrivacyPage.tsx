import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Separator } from "@/app/components/ui/separator";
import {
  Section,
  Body,
  BulletList,
} from "@/app/components/StaticPageComponents";

export function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Privacy Policy</CardTitle>
          <p className="text-sm text-muted-foreground">
            For the Websites of the Mt. Diablo Amateur Radio Club (MDARC)
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Body>
            By using our websites and services, you are a &ldquo;user&rdquo; and
            you accept and agree to this Privacy Policy. By interacting with our
            websites, or using our goods or services, you are agreeing to be
            subject to this policy in its entirety, without modification. If you
            do not accept and agree to all provisions of this policy, now or in
            the future, you may reject it by immediately terminating all access
            and use of our sites and services.
          </Body>

          <Separator />

          <Section title="Personal Information We Collect">
            <div className="space-y-3">
              <Body>
                Personal information means any information about an individual
                from which that person can be identified. It does not include
                data where the identity has been removed (anonymous data). You
                can visit the MDARC website without revealing any personal
                information. However, MDARC needs certain personal information
                to provide certain services.
              </Body>
              <Body>
                MDARC collects personal information when a visitor to our
                website completes and submits one of the forms linked from the
                website. Examples include: joining our Club, renewing your
                membership, updating your membership information, registering
                for a training course or class, registering for events such as
                the Pacificon℠ convention or Field Day, and volunteering for
                various activities.
              </Body>
              <Body>
                Payments by credit card are linked directly to a professional
                payment processing organization (e.g., PayPal) for the input of
                your credit card information. MDARC does not collect or have
                access to any personal credit card information.
              </Body>
              <Body>
                We do not knowingly collect data relating to children through
                this website. Children may only access the website and services
                of MDARC with parental consent.
              </Body>
              <Body>
                MDARC does not collect any specially identifiable information
                about anyone who simply views content on our website. We do not
                collect any special categories of personal data about you,
                including race or ethnicity, national origin, religious or
                philosophical beliefs, sex life, sexual orientation, disability,
                political opinions, trade union membership, or health, genetic,
                and biometric data.
              </Body>
            </div>
          </Section>

          <Separator />

          <Section title="How Your Personal Information is Used">
            <Body>
              Any personal information we collect from you may be used in one or
              more of the following ways:
            </Body>
            <div className="mt-2">
              <BulletList
                items={[
                  "To process your application to join our Club, renew your membership or update your membership information.",
                  "To populate our membership directory.",
                  "To allow you to register for a training course or class.",
                  "To allow you to register for a certain activity, such as a public service event, Field Day, Pacificon℠, etc.",
                  "To send you our monthly newsletter, the Carrier.",
                  "To allow you to sit for an amateur radio license exam.",
                  "To process transactions.",
                  "To contact you about your membership, our Club activities, and/or your registration for events we host.",
                  "To send occasional emails.",
                  "To improve customer service.",
                  "To contact you in the event you win a Grand Prize at Pacificon℠.",
                ]}
              />
            </div>
          </Section>

          <Separator />

          <Section title="How We Protect Your Information">
            <div className="space-y-3">
              <Body>
                We implement a variety of security measures to maintain the
                safety of your personal information. Only certain MDARC staff
                (e.g., the Membership Chair) has access to your personal
                information. Membership and event registration information is
                maintained in a secure database. Your credit card information is
                handled directly by a professional payment transaction
                organization, such as PayPal.
              </Body>
              <Body>
                However, please understand that it is impossible for MDARC to
                completely guarantee that your data will be immune from
                malicious attack or compromise. As such, your transmission of
                personal data is always at your own risk.
              </Body>
            </div>
          </Section>

          <Separator />

          <Section title="Third Party Content and Services">
            <div className="space-y-3">
              <Body>
                MDARC uses a few third parties to provide certain content and
                services, including organizations to help us process
                memberships, event registration and fee payments, and to provide
                these websites.
              </Body>
              <Body>
                These third-party sites have separate and independent privacy
                policies. These websites and systems may collect data about you,
                use cookies, embed additional third-party tracking, and monitor
                your interaction with the content. When you leave MDARC&apos;s
                website, you are encouraged to read the privacy policy of the
                website(s) you visit.
              </Body>
            </div>
          </Section>

          <Separator />

          <Section title="Photographs and Videos at MDARC Events">
            <Body>
              Photographers and/or videographers may be on site to document
              MDARC events and activities, including Pacificon. Photos and
              videos are the sole property of the Mt. Diablo Amateur Radio Club.
              By registering for and/or attending these events, attendees
              understand that MDARC/Pacificon℠ may use their likenesses on our
              websites, newsletters, flyers, brochures, etc.
            </Body>
          </Section>

          <Separator />

          <Section title="Cookies">
            <Body>
              MDARC does not use cookies with its websites. However, our sites
              are hosted by Google and they do use cookies for websites hosted
              by them. MDARC has no control over the cookies placed by Google,
              nor do we have access to the individual data collected by them.
            </Body>
          </Section>

          <Separator />

          <Section title="Your Legal Rights">
            <Body>
              Under certain circumstances, you have rights under data protection
              laws in relation to your personal data. You may:
            </Body>
            <div className="mt-2">
              <BulletList
                items={[
                  "Request access to the personal data we hold about you.",
                  "Request correction of your personal data.",
                  "Request erasure of your personal data.",
                  "Object to processing of your personal data.",
                  "Request restriction of processing your personal data.",
                  "Right to withdraw consent at any time.",
                ]}
              />
            </div>
          </Section>

          <Separator />

          <Section title="Consent">
            <Body>By using our site, you consent to these policies.</Body>
          </Section>

          <Separator />

          <Section title="Changes to Our Policies">
            <Body>
              These rules and policies are subject to change without advance
              notice. Any and all changes will be reflected in this document,
              once the change applies.
            </Body>
          </Section>

          <Separator />

          <Section title="Contacting Us">
            <Body>
              If there are any questions regarding this Privacy Policy, you may
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
