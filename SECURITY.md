# Security Policy

## Experimental Status

The Google Glass Explorer Edition (Google Glass XE) companions communicate with
the iPhone apps through raw local TCP sockets. The current protocol does not
authenticate a Google Glass XE device or sign
messages.

Use the companions only on a trusted local network or an iPhone Personal
Hotspot. Do not treat the current bridge as suitable for sensitive,
high-risk, or enterprise deployments.

Before a broad public beta, the protocol should add:

- explicit device pairing;
- a per-device secret stored securely on iPhone;
- authenticated messages with replay protection; and
- strict payload and connection limits.

## Reporting

Please report vulnerabilities privately through GitHub's private vulnerability
reporting feature for this repository. Do not include API keys, recordings,
transcripts, food images, or other personal data in a public issue.

## Secrets

Never commit API keys, Apple signing assets, provisioning profiles, Android
keystores, generated APKs, App Store archives, or personalized export options.
