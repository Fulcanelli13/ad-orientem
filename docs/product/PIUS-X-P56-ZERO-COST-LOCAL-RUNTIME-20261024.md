# St Pius X P2.56 — €0 local GPU private runtime (research only)

**Status:** Local PC pilot implemented. Not a hosted service, phone-native offline AI, app release, or a proven scalable offering. Original SPX 106 subjects / 423 answers unchanged. No outside reviewers or contacts. No paid APIs, keys, cloud inference, hosting, or subscriptions.

## Practical decision

Qwen2.5 7B (Q4_K_M) is a **candidate for a self-owned desktop GPU**, not the production engine for 20–50 independently operating Android phones. Our genuine GitHub CPU benchmark [P2.54](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40108274544) took **163–236 seconds per reply**, including sequential composer and verifier passes. All four outputs passed the machine checks; this is not human certification. The comparison is now visible inside the actual papal study. A usable live visitor experience needs two passes in seconds, not minutes.

The tested `Qwen2.5-7B-Instruct-Q4_K_M` quantized model file is approximately **4.7 GB**, with **more memory required during inference**. As a planning estimate, GPU with **~8 GB VRAM** is an appropriate first target, but actual availability, model offloading and response speed MUST be measured on the user's existing device. A 4–6 GB GPU, integrated graphics or CPU-only setup may be slow or fail to load. No purchases should be made for this pilot.

## P2.57 — hardware check before downloading any 7B weights

On the existing Windows PC, open PowerShell in the Ad Orientem repository checkout and run:

```powershell
node tools/pius-x-p56-local-pilot.mjs --hardware
```

**No opt-in, running model, cloud API, internet access or subscription is required.**
This reads operating-system RAM and available NVIDIA-SMI device information locally, prints the installed VRAM and applies a **nonbinding readiness classification**. The results are not uploaded. An NVIDIA GPU with **at least 8 GB VRAM** and **12 GB system RAM** is a first **candidate for benchmarking, not a guarantee of acceptable performance**. Older or weaker hardware could still work with partial GPU offload, but its actual speed must be measured.

AMD/Intel graphics do not usually appear in NVIDIA-SMI, so **“GPU not detected” does not mean the PC lacks graphics acceleration**. Such devices may support Vulkan or other backends, but require separate testing.

The operator does not have to buy a GPU. If the existing hardware is insufficient, use the €0 offline visual-novel demonstration instead of purchasing hardware or activating a remote API.

The subsequent `--benchmark` command now records **separate composer and verifier timings**, alongside each EN/FR total. Only an actual run with a local inference server constitutes a real latency result; CI's local-model fixture is not that result.

## How to run on an existing Windows PC, with €0 new spending

1. Have a free, GPU-capable build of **llama.cpp** with `llama-server` on the PC. Follow [llama.cpp's official local server documentation](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md) for an appropriate CUDA/Vulkan/Metal build. Merely using a binary without your GPU backend will not accelerate inference.
2. Obtain the existing approved test quantization **`Qwen2.5-7B-Instruct-Q4_K_M.gguf`** from [bartowski/Qwen2.5-7B-Instruct-GGUF](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF) under the Qwen2.5-7B Apache-2.0 model lineage. **Do not** download it onto each phone. Preserve the pinned SHA-256 from the P2.54 benchmark: `65b8fcd92af6b4fefa935c625d1ac27ea29dcb6ee14589c55a8f115ceaaa1423`. Verify the file before use.
3. In **PowerShell**, with actual file paths substituted, launch the free model server on **loopback only** (do NOT use `--host 0.0.0.0`):
   ```powershell
   .\llama-server.exe -m "C:\Models\Qwen2.5-7B-Instruct-Q4_K_M.gguf" --host 127.0.0.1 --port 8766 -ngl all -c 4096 --parallel 1 --alias Qwen2.5-7B-Instruct-Q4_K_M
   ```
   When checking the model file in PowerShell: `(Get-FileHash "C:\Models\Qwen2.5-7B-Instruct-Q4_K_M.gguf" -Algorithm SHA256).Hash.ToLower()`. Confirm it matches the pinned hash. CLI flags vary across llama.cpp releases; inspect `--help`.
4. In the existing Ad Orientem GitHub checkout, another **PowerShell** window:
   ```powershell
   $env:AO_SPX_LOCAL_PILOT_MODE="I_AM_RUNNING_A_PRIVATE_LOCAL_MODEL"
   node tools/pius-x-p56-local-pilot.mjs --hardware
   node tools/pius-x-p56-local-pilot.mjs --prepare
   node tools/pius-x-p56-local-pilot.mjs --diagnose
   node tools/pius-x-p56-local-pilot.mjs --benchmark
   node tools/pius-x-p56-local-pilot.mjs --serve
   ```
   Open **http://127.0.0.1:8787** in that PC's browser. This provides the existing visual novel in research mode and a bounded historical editorial voice option. The `E supremi` pilot uses short bilingual claim cues; the verifier receives the original Latin-source evidence. A generated reply is always unapproved.

### Tests and readiness

The `--diagnose` command **never generates prose**. It checks that `http://127.0.0.1:8766/health` reports readiness and that `/v1/models` advertises exactly the pinned model alias. That alias is a server assertion, **not** cryptographic verification of the underlying weights; verify the file hash separately.

The `--benchmark` command actually performs one EN and one FR **composer-plus-verifier** exchange using the original narrow papal sources. It prints each round-trip latency and classifies:
- **≤ 15 seconds:** candidate for interactive testing, but further real-device tests required.
- **15–45 seconds:** slow private demonstration only.
- **Over 45 seconds:** unsuitable for live visitors on that device.

Passing the benchmark never certifies the text as Pius X's actual words or establishes scalability. The current backend uses sequential compose and verify requests and handles **one active visitor at a time**. A local GPU that works for one owner cannot be assumed to handle 20–50 users.

### Offline fallback (guaranteed €0 new service charges)

The existing offline study is created by `--prepare` at `artifacts/pius-x-study-expanded/SPX_P26_Offline_Source_Dialogue_Demo.html`. It is a standalone, no-network visual novel with 11 evidence-bound example questions, existing source browsing, EN/FR specimens and five approved sprites. It does **not** compose arbitrary new text. When there is no compatible GPU/server, use this authored option rather than routing questions to a paid API or lowering source restrictions.

### Important exclusions

- **Never expose the model server or review server to the public internet or a LAN**. Both are bound to `127.0.0.1` by default and the P2.56 driver rejects remote endpoints. A phone **cannot** use this server from another device.
- Do not paste API keys, enable cloud inference, set `--host 0.0.0.0`, or infer that GitHub Actions constitutes permanent free inference hosting.
- No publication, authentic-quote claim or translation approval. The model's use in an app still requires product validation and testing of its redistribution setup.
- Installing the APK on 20–50 different user phones with arbitrary hardware is a **separate feasibility gate**. An actual unrestricted €0 public AI backend has **not** been established. Until that exists, the honest pilot option is authored/offline dialogue or a consciously limited local desktop demo.

**Sources:** [official llama.cpp server](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md), [Qwen 7B model and weights](https://huggingface.co/bartowski/Qwen2.5-7B-Instruct-GGUF), [real P2.54 four-response benchmark](https://github.com/Fulcanelli13/ad-orientem/actions/runs/40108274544).
