import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';

import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <Heading as="h1" className="hero__title">
            Get EagleEye running on your robot
          </Heading>
          <p className={styles.tagline}>{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/user-guide/overview">
              Start setup
            </Link>
          </div>
          <div className={styles.statRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>1. Install</div>
              <div className={styles.statLabel}>
                One command on supported Debian 12 ARM64 hardware
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>2. Build a pipeline</div>
              <div className={styles.statLabel}>
                Discover and check cameras, then wire up detection in the web UI
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>3. Publish pose</div>
              <div className={styles.statLabel}>
                Publish robot pose to NetworkTables with a configured output node
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

const showcaseItems = [
  {
    title: 'See live detections',
    body: 'Open an operation to inspect its output while the pipeline runs.',
    image: '/img/ui-screenshots/apriltag-detection-frame.png',
    alt: 'Live camera frame with detected AprilTags marked',
    to: '/docs/user-guide/pipeline-setup',
  },
  {
    title: 'Build the graph',
    body: 'Wire camera input, AprilTag detection, pose, and NetworkTables output.',
    image: '/img/ui-screenshots/pipeline-setup/apriltag-input-detection-closeup.png',
    alt: 'AprilTag operations connected in the Pipeline tab',
    to: '/docs/user-guide/pipeline-setup',
  },
  {
    title: 'Check pose on the field',
    body: 'The 3D view makes bad camera placement and pose jumps obvious.',
    image: '/img/ui-screenshots/3d-view-tab.png',
    alt: 'Robot pose shown on the field in the 3D View tab',
    to: '/docs/user-guide/verify-and-tune',
  },
  {
    title: 'Calibrate in the browser',
    body: 'See detected ChArUco corners and coverage while collecting calibration frames.',
    image: '/img/ui-screenshots/calibration-live-coverage.png',
    alt: 'ChArUco detections and captured corner coverage in the calibration tool',
    to: '/docs/user-guide/calibrate-intrinsics#4-capture-frames',
  },
  {
    title: 'Run the device',
    body: 'Connect Wi-Fi, read logs, restart the backend, or use the built-in terminal.',
    image: '/img/ui-screenshots/wifi-manager.png',
    alt: 'Wi-Fi Network Manager opened from the Settings tab',
    to: '/docs/user-guide/connect-wifi#connect-from-the-web-ui-after-installation',
  },
  {
    title: 'See what each operation sees',
    body: 'Tune preprocessing beside its live output, then keep the graph running.',
    image: '/img/ui-screenshots/pipeline-setup/apriltag-temporal-live-view.png',
    alt: 'Temporal Acceleration settings beside its live processed frame',
    to: '/docs/user-guide/temporal-acceleration#2-configure-it',
  },
];

function ShowcaseItem({item}) {
  const imageUrl = useBaseUrl(item.image);
  return (
    <Link
      className={clsx(styles.showcaseCard, item.className)}
      to={item.to}>
      <div className={styles.showcaseFrame}>
        <img src={imageUrl} alt={item.alt} loading="lazy" />
      </div>
      <div className={styles.showcaseCopy}>
        <Heading as="h3">{item.title}</Heading>
        <p>{item.body}</p>
      </div>
    </Link>
  );
}

function HomepageShowcase() {
  return (
    <section className={styles.screenshotSection}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          See what the system is doing
        </Heading>
        <p className={styles.sectionBody}>
          Open <code>http://&lt;device-ip&gt;:5001</code> from a laptop on the
          robot network. The UI covers camera setup, pipeline editing, live status,
          and device controls.
        </p>
        <div className={styles.showcaseGrid}>
          {showcaseItems.map((item) => (
            <ShowcaseItem item={item} key={item.title} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="FRC vision, from install to robot pose"
      description="Install EagleEye, set up an AprilTag pipeline, and publish robot pose to NetworkTables.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <HomepageShowcase />
      </main>
    </Layout>
  );
}
