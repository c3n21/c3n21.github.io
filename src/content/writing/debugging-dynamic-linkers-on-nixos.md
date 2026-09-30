---
title: 'Debugging Dynamic Linker and Runtime Failures on NixOS'
description: 'Investigating why bundled language servers fail on non-FHS Linux, tracing ELF interpreters with strace, and building hermetic wrappers.'
publishDate: '2026-03-15'
tags:
    - nix
    - nixos
    - debugging
    - linux
    - tooling
draft: false
---

## Observation

When setting up Neovim on a fresh NixOS installation, configuring the SonarSource language server (`sonarlint-ls`) resulted in an immediate, opaque startup crash:

```text
exec: /nix/store/...-sonarlint-ls/bin/sonarlint-ls: No such file or directory
```

To any engineer unfamiliar with NixOS, this error is notoriously misleading: the target binary clearly exists on disk, permissions are executable (`chmod +x`), and yet the shell reports that the file cannot be found.

## Hypotheses

1. **Missing Shell Shebang**: The executable script might have an invalid `#!/bin/bash` or `#!/bin/sh` shebang header that fails on NixOS because `/bin` contains only `/bin/sh`.
2. **Missing Bundled JRE**: The language server distribution is a Java application bundled with a native binary launcher. The launcher might fail to locate a compatible Java Virtual Machine at runtime.
3. **Hardcoded Dynamic Linker (ELF Interpreter)**: Pre-compiled Linux ELF binaries expect the standard FHS dynamic linker path (typically `/lib64/ld-linux-x86-64.so.2`). On NixOS, no such path exists; the dynamic linker resides inside `/nix/store/<hash>-glibc/lib/ld-linux-x86-64.so.2`.

## Experiments & Diagnostics

To isolate which hypothesis was correct, I inspected the binary header using `file` and `readelf`:

```bash
readelf -l sonarlint-ls | grep interpreter
# [Requesting program interpreter: /lib64/ld-linux-x86-64.so.2]
```

The output confirmed Hypothesis 3: the binary requested `/lib64/ld-linux-x86-64.so.2`. On standard FHS distributions (Ubuntu, Fedora, Debian), the kernel finds the dynamic linker at that standard location. On NixOS, the kernel returns `ENOENT`, which user space reports as "No such file or directory" for the binary itself.

Next, I used `patchelf` to inspect what shared libraries the executable required:

```bash
readelf -d sonarlint-ls | grep NEEDED
```

The binary depended on `libc.so.6`, `libm.so.6`, and `libpthread.so.0`. Even if patched with the Nix store's `glibc` interpreter, the launcher also needed access to bundled Java native interface (JNI) shared objects that were dynamically loaded at runtime via `dlopen()`.

## Result & Upstream Fix

Rather than hacking local symlinks into the root filesystem (which violates NixOS reproducibility), I constructed a hermetic Nix derivation. 

Using Nix's `makeWrapper` utility, I engineered a wrapper script that:
1. Pinned the exact OpenJDK dependency from the Nix store.
2. Formatted the `LD_LIBRARY_PATH` environment variable dynamically to include required native libraries.
3. Wrapped the invocation with explicit flags specifying the application home directory.

```nix
makeWrapper "${jre}/bin/java" "$out/bin/sonarlint-ls" \
  --add-flags "-jar $out/share/sonarlint-ls/sonarlint-ls.jar" \
  --prefix LD_LIBRARY_PATH : "${lib.makeLibraryPath [ stdenv.cc.cc.lib zlib ]}"
```

I tested the derivation across clean isolated development environments, verified that Neovim successfully established an LSP RPC connection over standard I/O, and submitted upstream PR #462269 to `NixOS/nixpkgs`, where it was merged into both unstable and stable channels.

## Reusable Engineering Lessons

1. **"File Not Found" for Binaries Means Linker Missing**: On Linux, `ENOENT` on an `execve` syscall of an existing binary almost always indicates that the ELF dynamic interpreter (PT_INTERP) is missing, not the binary itself.
2. **Explicit Dependency Wrapping Over Global State**: Wrapping binaries with deterministic environment variables and interpreter paths isolates application runtimes and prevents runtime conflicts across packages.
3. **Upstream Fixes Outlast Private Workarounds**: Submitting a clean derivation upstream to community package repositories eliminates private maintenance burden and permanently solves the issue for other engineers.
