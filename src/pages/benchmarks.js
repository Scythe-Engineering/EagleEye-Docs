import React from "react";
import Layout from "@theme/Layout";
import useBaseUrl from "@docusaurus/useBaseUrl";

/** Display the standalone benchmark report inside the docs site. */
export default function Benchmarks() {
  const reportUrl = useBaseUrl("/benchmarks/report.htm");

  return (
    <Layout title="Benchmarks" description="EagleEye and PhotonVision benchmark results">
      <iframe
        src={reportUrl}
        title="EagleEye and PhotonVision exact-frame benchmark"
        style={{ display: "block", width: "100%", height: "calc(100vh - 60px)", border: 0 }}
      />
    </Layout>
  );
}
