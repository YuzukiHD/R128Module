# USB

USB 驱动主要实现设备驱动的底层细节，并为上层提供一套标准的 API 接口以供使用。USB模块主要特性如下：

- Complies with USB 2.0 Specification 
- Supports High-Speed (HS, 480-Mbps), Full-Speed (FS, 12-Mbps), and Low-Speed (LS, 1.5-Mbps) in Host mode 
- Supports High-Speed (HS, 480 Mbps), Full-Speed (FS, 12 Mbps) in Device mode 
- Supports the UTMI+ Level 3 interface. The 8-bit bidirectional data buses are used 
- Supports bi-directional endpoint0 for Control transfer 
- Supports up to 8 User-Configurable Endpoints for Bulk, Isochronous and Interrupt bi-directional transfers (Endpoint1, Endpoint2, Endpoint3, Endpoint4) 
- Supports up to (4KB+64Bytes) FIFO for EPs (Including EP0) 
- Supports High-Bandwidth Isochronous & Interrupt transfers 
- Automated splitting/combining of packets for Bulk transfers 
- Supports point-to-point and point-to-multipoint transfer in both Host and Peripheral mode 
- Includes automatic ping capabilities 
- Soft connect/disconnect function 
- Performs all transaction scheduling in hardware 
- Power Optimization and Power Management capabilities 
- Includes interface to an external Normal DMA controller for every Eps 