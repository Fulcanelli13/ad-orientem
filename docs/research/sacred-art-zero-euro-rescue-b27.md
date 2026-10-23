# Ad Orientem Sacred Art — zero-euro original-image rescue

Status: P0 preservation, **NOT editorial or publication approval**.

## Scope and evidence

- Source workflow: [B26 preservation run 40021937137](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40021937137).
- Original acquisition waves: B19 through B25, specifically the 16 source-artifact IDs enumerated in `.github/workflows/ao-art-b26-artifact-preservation.yml`.
- Confirmed by all 16 B26 job logs: **290 source image files** totalling **3,076,497,763 bytes** before package compression. This is a file count, not an assertion of 290 unique artworks.
- All 16 B26 temporary replacement artifacts have a GitHub-reported expiry of **2027-01-21T20:47:32Z**. The original seven-day artifacts generally expire sooner.
- B26 inserted `AO_PRESERVATION_SHA256_INDEX.json` into each package and made no editorial approvals.
- B27 rescue branch: `rescue/sacred-art-zero-euro-20261024`.
- Draft (unpublished) release tag: `sacred-art-originals-b26-20261024`.

## What the rescue workflow does

1. Works **only** with the 16 already-preserved B26 artifacts; it does not download new third-party images.
2. Downloads them using the repository's existing GitHub Actions permissions.
3. Re-hashes every source image file and checks exact sizes and the indexed image path set.
4. Packs each wave into an uncompressed TAR; image bytes inside are not modified.
5. Uploads each TAR to a **draft, unpublished** GitHub Release. It intentionally never publishes the release: publication rights have not been evaluated for every asset.
6. Downloads each release asset again and compares it byte-for-byte with the uploaded TAR.
7. Verifies all 16 assets are present and writes `AO_ARCHIVE_RELEASE_INDEX.json` as an additional release asset.

The GitHub repository remains public, but **the preservation release must remain a draft** until an explicit item-by-item publication-rights review authorizes otherwise. Publishing the release indiscriminately is forbidden.

The archive workflow uses only standard Ubuntu runners in this public repository and GitHub Releases. No paid cloud service, Git LFS, premium runner or billing upgrade is required.

## Verification and recovery

The protected research files and acquired originals are different things. Registry entries and source URLs are not proofs that an original-file copy exists.

For authorized repository maintainers with GitHub CLI and adequate existing disk space:

```bash
gh auth login
gh release download sacred-art-originals-b26-20261024 \
  --repo Fulcanelli13/ad-orientem \
  --pattern 'ao-source-b26-*.tar' \
  --dir sacred-art-original-backup
```

To inspect one archive:

```bash
tar -tf sacred-art-original-backup/ao-source-b26-b19.tar | head
tar -xf sacred-art-original-backup/ao-source-b26-b19.tar -C <existing-directory>
```

Keep a second full copy on storage already owned, if possible. GitHub Releases are materially longer-lived than expiring Actions artifacts, but **GitHub must not be described as an archival permanence guarantee**.

## Important limits

- This rescue does **not** establish uniqueness, completeness of the entire sacred-art catalogue, copyright permissions, quality or publication suitability.
- The total of 290 is the sum of files in the named 16 acquisition source archives. Other historic acquisitions and review-gallery artifacts need a separate audit.
- A draft release is not a published application resource. Apps should continue using only editorially approved art.
- The archive is not fully rescued until the final workflow gate is green and the release asset checks all pass.
- Suspend further short-retention original-art acquisition waves until the archival process is made a compulsory step in acquisition workflows.
- If workflow runs fail, use their job logs. B26 originals remain in the temporary safety copies through the listed expiry, barring exceptional deletion or repository-policy changes.
