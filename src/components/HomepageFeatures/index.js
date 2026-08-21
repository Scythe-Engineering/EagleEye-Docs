import Link from '@docusaurus/Link';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Install on your hardware',
    description:
      'Flash or SSH into supported Debian 12 ARM64 hardware, run the install command, and reach the web UI on port 5001.',
    link: {label: 'Install', to: '/docs/user-guide/install'},
  },
  {
    title: 'Set up cameras',
    description:
      'Discover cameras, check their views, calibrate intrinsics, and place them on the robot for a usable field pose.',
    link: {label: 'Cameras', to: '/docs/user-guide/cameras'},
  },
  {
    title: 'Publish AprilTag pose',
    description:
      'Send robot pose to NetworkTables so your drive code can consume it, then keep it healthy on match day.',
    link: {label: 'NetworkTables', to: '/docs/user-guide/networktables'},
  },
];

function Feature({title, description, link}) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        <Heading as="h3" className={styles.featureTitle}>
          {title}
        </Heading>
        <p className={styles.featureBody}>{description}</p>
        {link ? (
          <Link className={styles.featureLink} to={link.to}>
            {link.label} →
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props) => (
            <Feature key={props.title} {...props} />
          ))}
        </div>
        <p className={styles.devNote}>
          Extending EagleEye or adding an operation?{' '}
          <Link to="/docs/codebase/overview">Developer Docs</Link>
        </p>
      </div>
    </section>
  );
}
