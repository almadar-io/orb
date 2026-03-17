# Orb CLI Installer for Windows
# https://orb.almadar.io
#
# Usage:
#   irm https://orb.almadar.io/install.ps1 | iex
#   $env:ORB_VERSION = "v1.0.0"; irm https://orb.almadar.io/install.ps1 | iex
#
# Environment variables:
#   ORB_INSTALL_DIR - Installation directory (default: $HOME\.orb\bin)
#   ORB_VERSION     - Version to install (default: latest)

$ErrorActionPreference = 'Stop'

# Default values
$InstallDir = if ($env:ORB_INSTALL_DIR) { $env:ORB_INSTALL_DIR } else { "$HOME\.orb\bin" }
$Version = if ($env:ORB_VERSION) { $env:ORB_VERSION } else { "latest" }
$GitHubRepo = "almadar-io/almadar"

function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Get-Platform {
    $arch = [System.Runtime.InteropServices.RuntimeInformation]::OSArchitecture
    switch ($arch) {
        "X64" { return "windows-x64" }
        "Arm64" { return "windows-arm64" }
        default {
            Write-ColorOutput Red "Unsupported architecture: $arch"
            exit 1
        }
    }
}

function Get-LatestVersion {
    $response = Invoke-RestMethod -Uri "https://api.github.com/repos/$GitHubRepo/releases/latest" -Headers @{ "User-Agent" = "Orb-Installer" }
    return $response.tag_name
}

function Install-OrbCLI {
    $Platform = Get-Platform

    Write-ColorOutput Blue "Orb CLI Installer"
    Write-Output ""

    # Get version
    if ($Version -eq "latest") {
        Write-Output "Fetching latest version..."
        try {
            $Version = Get-LatestVersion
        } catch {
            Write-ColorOutput Red "Failed to get latest version: $_"
            exit 1
        }
    }

    Write-Output "Platform: $Platform"
    Write-Output "Version: $Version"
    Write-Output "Install directory: $InstallDir"
    Write-Output ""

    # Construct download URL
    $Filename = "orb-$Platform.zip"
    $DownloadUrl = "https://github.com/$GitHubRepo/releases/download/$Version/$Filename"

    # Create temp directory
    $TempDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }

    try {
        # Download
        Write-Output "Downloading $Filename..."
        $ZipPath = Join-Path $TempDir $Filename
        Invoke-WebRequest -Uri $DownloadUrl -OutFile $ZipPath -UseBasicParsing

        # Extract
        Write-Output "Extracting..."
        Expand-Archive -Path $ZipPath -DestinationPath $TempDir -Force

        # Install
        Write-Output "Installing to $InstallDir..."
        if (-not (Test-Path $InstallDir)) {
            New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        }

        $ExePath = Join-Path $TempDir "orb.exe"
        if (Test-Path $ExePath) {
            Copy-Item $ExePath -Destination $InstallDir -Force
        } else {
            # Try to find it in subdirectory
            $ExePath = Get-ChildItem -Path $TempDir -Filter "orb.exe" -Recurse | Select-Object -First 1
            if ($ExePath) {
                Copy-Item $ExePath.FullName -Destination $InstallDir -Force
            } else {
                Write-ColorOutput Red "Could not find orb.exe in downloaded archive"
                exit 1
            }
        }

        Write-Output ""
        Write-ColorOutput Green "Orb CLI installed successfully!"
        Write-Output ""

        # Check if in PATH
        $CurrentPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if ($CurrentPath -notlike "*$InstallDir*") {
            Write-ColorOutput Yellow "Add the following to your PATH:"
            Write-Output ""
            Write-Output "  [Environment]::SetEnvironmentVariable('Path', `$env:Path + ';$InstallDir', 'User')"
            Write-Output ""
            Write-Output "Or run this command to add it automatically:"
            Write-Output ""
            Write-Output "  [Environment]::SetEnvironmentVariable('Path', [Environment]::GetEnvironmentVariable('Path', 'User') + ';$InstallDir', 'User')"
            Write-Output ""
        }

        Write-Output "Then run 'orb --help' to get started."
    }
    finally {
        # Cleanup
        Remove-Item -Path $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

Install-OrbCLI
