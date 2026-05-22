# Deployment Guide

## Target

Primary deployment target is GitHub Pages for public beta validation.

## Steps

1. Run local checks:
`npm run build`

2. Run validation scripts:
`node tools/run-validation.mjs validate:artifacts`
`node tools/run-validation.mjs validate:reliability`
`node tools/run-validation.mjs validate:performance`
`node tools/run-validation.mjs validate:release`

3. Ensure artifacts are generated in:
`reports/`, `benchmarks/`, `snapshots/`, `release-checks/`.

4. Deploy generated static bundle from `dist/`.
