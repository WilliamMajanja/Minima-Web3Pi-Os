# PiNet Web3 OS

The official Web3-native operating system distribution for Raspberry Pi clusters by Minima. Featuring decentralized node management, hardware hat orchestration, and agentic payment protocols.

![License](https://img.shields.io/badge/license-MIT-blue.svg) ![Version](https://img.shields.io/badge/version-1.0.35-green.svg) ![Platform](https://img.shields.io/badge/platform-Raspberry%20Pi%205-red.svg)

## 🖥️ Web3 Desktop Interface

The user interface is a high-performance React application designed to run in GPU-accelerated Kiosk mode on the Raspberry Pi 5 via `pinetos-shell.service`.

### Key Applications
*   **Minima Node Core**: Real-time blockchain visualization, block height, and peer status.
*   **Cluster Orchestrator**: Manage PXE-booted worker nodes (NPU/Sense/Storage) and topology.
*   **DePAI Executor**: Run Agentic AI tasks with M.402 streaming payments.
*   **Visual Asset Studio**: Generative UI/UX tools powered by Gemini 1.5 & Veo.
*   **Maxima Messenger**: Decentralized, encrypted peer-to-peer communication.
*   **PiNet Shell**: Integrated terminal with full VFS access to system configuration.

### Development
Run the interface locally for development:

```bash
npm install
npm run dev
```

## 🍓 OS Image Build

To compile the hardened OS image (Debian 13 Trixie base) for production deployment on physical hardware:

### Requirements
*   Raspberry Pi 5 or Debian/Ubuntu Host
*   Docker installed
*   30GB Free Disk Space

### Build Process

```bash
# 1. Install dependencies
sudo apt update
sudo apt install -y git rsync curl xz-utils parted qemu-user-static debootstrap zerofree zip unzip genisoimage squashfs-tools docker.io chromium network-manager cryptsetup tpm2-tools openssl

# 2. Setup Build Environment
git clone https://github.com/RaspberryPiFoundation/raspi-image-gen.git
mv raspi-image-gen PiNetOS/raspi-image-gen
cd PiNetOS

# 3. Compile Image
chmod +x build.sh scripts/*.sh overlay/rootfs/usr/local/bin/*
sudo ./build.sh
```

**Output Artifact:** `tools/output/PiNetOS.img`

## 🔐 Security Architecture
*   **Secure Boot**: Signed kernel images verified by hardware root of trust.
*   **Measured Boot**: TPM 2.0 integration for chain of trust validation.
*   **A/B OTA**: Atomic updates with automatic rollback protection on failure.
*   **Encrypted Storage**: LUKS encrypted `/data` partitions for wallet keys.
*   **Kiosk Lockdown**: X11/Openbox configuration with restricted input methods.

## 🤝 Contributing
1.  Fork the repository
2.  Create your feature branch (`git checkout -b feature/amazing-feature`)
3.  Commit your changes (`git commit -m 'Add some amazing feature'`)
4.  Push to the branch (`git push origin feature/amazing-feature`)
5.  Open a Pull Request
