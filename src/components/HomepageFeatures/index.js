import Link from '@docusaurus/Link';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const FeatureList = [
  {
    title: 'Pipeline-first',
    description:
      'Understand how frames flow through definitions and secondary ops, with quick links to config and debugging notes.',
    link: {label: 'Pipelines', to: '/docs/codebase/pipelines'},
  },
  {
    title: 'Device-aware',
    description:
      'CPU, GPU, and MX3 paths are covered, plus guidance on extending the compute pool for new hardware.',
    link: {label: 'Device Management', to: '/docs/codebase/device-management'},
  },
  {
    title: 'Operator-friendly',
    description:
      'User guide walks through setup, running, and troubleshooting with placeholders to fill for your environment.',
    link: {label: 'User Guide', to: '/docs/user-guide/overview'},
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
      </div>
    </section>
  );
}
