import React from "react";
import Layout from "@theme/Layout";
import Link from "@docusaurus/Link";

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "60vh",
  textAlign: "center",
  padding: "2rem",
};

const codeBlockStyle: React.CSSProperties = {
  fontFamily: "var(--ifm-font-family-monospace)",
  fontSize: "1.1rem",
  background: "var(--ifm-color-emphasis-100)",
  borderRadius: "8px",
  padding: "1.5rem 2rem",
  marginBottom: "2rem",
  maxWidth: "420px",
  textAlign: "left",
  lineHeight: 1.8,
};

const commentStyle: React.CSSProperties = {
  color: "var(--ifm-color-emphasis-500)",
};

const errorStyle: React.CSSProperties = {
  color: "var(--ifm-color-danger)",
  fontWeight: 600,
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  fontWeight: 600,
  marginBottom: "1rem",
};

const messageStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  color: "var(--ifm-color-emphasis-600)",
  marginBottom: "2rem",
  maxWidth: "480px",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  fontSize: "1rem",
};

export default function NotFound(): React.ReactNode {
  return (
    <Layout title="Page not found">
      <main style={containerStyle}>
        <pre style={codeBlockStyle}>
          <span style={commentStyle}>{"// 404: undefined\n"}</span>
          <span style={errorStyle}>{"error"}</span>
          {": page not found\n"}
          <span style={commentStyle}>{"// did you mean: /"}</span>
        </pre>
        <div style={headingStyle}>This route doesn't resolve</div>
        <p style={messageStyle}>
          The page you requested isn't part of the Orb spec.
          Head back to the docs and try a different path.
        </p>
        <Link className="button button--primary button--lg" to="/" style={buttonStyle}>
          Back to Orb Docs
        </Link>
      </main>
    </Layout>
  );
}
