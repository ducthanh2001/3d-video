---
name: no-powershell-set-content-edits
description: Do not edit source files with PowerShell Get-Content/Set-Content on this machine; it corrupts UTF-8 and adds a BOM
metadata:
  node_type: memory
  type: feedback
  originSessionId: 4003487e-6bb2-4bd6-a79d-aff6156d16a5
  modified: 2026-11-06T04:46:20.626Z
---

Editing files with `Get-Content -Raw` + `Set-Content -Encoding utf8` in Windows PowerShell 5.1 read UTF-8 files as ANSI and wrote them
back double-encoded (e.g. "×" became "Ã—", "▲" became "â–²") and added a BOM. This happened on 2026-11-06 in video-ai and had to be repaired.

**Why:** PS 5.1 defaults to the system ANSI code page when reading files without a BOM.
**How to apply:** use the Edit/Write tools for source changes; if a script is unavoidable, use
`[IO.File]::ReadAllText/WriteAllText` with `New-Object System.Text.UTF8Encoding($false)`. Related: [[stick-film-kit]].
