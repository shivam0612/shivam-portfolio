import { ContactForm } from '../components/contact/ContactForm';
import { ContactInfo } from '../components/contact/ContactInfo';
import { Reveal } from '../components/animations/Reveal';
import { useSeo } from '../lib/seo';

export default function Contact() {
  useSeo({
    title: 'Contact',
    path: '/contact',
    description:
      'Get in touch with Shivam Patel about supply chain operations, operational leadership, process improvement, or technology.',
  });
  return (
    <section className="container contact">
      <Reveal y={10}>
        <ContactInfo />
      </Reveal>
      <Reveal y={10} delay={0.1}>
        <div className="contact__form panel">
          <h2 className="contact__form-title">Send a message</h2>
          <ContactForm />
        </div>
      </Reveal>
    </section>
  );
}
