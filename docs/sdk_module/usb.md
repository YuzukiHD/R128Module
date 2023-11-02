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

## 模块配置

> R128 仅有一个 USB，HAL 驱动支持两个及以上 USB 外设，故部分配置为空。

```
Kernel Setup --->
    Drivers Setup --->
        SoC HAL Drivers --->
            USB devices --->
                [*] enable USB driver
                [*] USB HOST  --->
                	[*]   Support usb host ehci0 # USB0 配置
                	[*]   Support usb host ohci0
                	[ ]   Support usb host ehci1 # USB1 配置
                	[ ]   Support usb host ohci1 
                	[*]     Mass Storage support
                	[*]       USB CD support
                	[ ]     Carplay host support
                	[ ]     UVC support
                	[ ]     HID support
                [*] USB DEVICE  --->
                	[ ]   enable dma for udc driver
                	[*]   Support usb gadget driver
                		usb gadget driver (adb gadget driver)  --->
                			(X) adb gadget driver
                			( ) mtp gadget driver
                			( ) uac gadget driver
                			( ) ncm gadget driver
                			( ) msc gadget driver
                [*] USB MANAGER
```

## 源码结构

```
.
├── Kconfig
├── Makefile
├── common               # 公共操作
│   ├── Makefile
│   ├── list_head_ext.c
│   ├── list_head_ext.h
│   ├── usb_init.c
│   ├── usb_init.h
│   ├── usb_phy.c
│   └── usb_phy.h
├── core                 # USB 核心驱动
│   ├── Makefile
│   ├── urb.c
│   ├── urb.h
│   ├── usb_core_base.c
│   ├── usb_core_base.h
│   ├── usb_core_config.c
│   ├── usb_core_config.h
│   ├── usb_core_init.c
│   ├── usb_core_init.h
│   ├── usb_core_interface.c
│   ├── usb_core_interface.h
│   ├── usb_driver_init.c
│   ├── usb_driver_init.h
│   ├── usb_gen_hcd.c
│   ├── usb_gen_hcd.h
│   ├── usb_gen_hcd_rh.c
│   ├── usb_gen_hcd_rh.h
│   ├── usb_gen_hub.c
│   ├── usb_gen_hub.h
│   ├── usb_gen_hub_base.c
│   ├── usb_gen_hub_base.h
│   ├── usb_msg.c
│   ├── usb_msg.h
│   ├── usb_msg_base.c
│   ├── usb_msg_base.h
│   ├── usb_virt_bus.c
│   └── usb_virt_bus.h
├── gadget             # gadget 相关实现
│   ├── Makefile
│   ├── function
│   │   ├── adb.c
│   │   ├── msc
│   │   │   ├── msc.c
│   │   │   ├── scsi.c
│   │   │   ├── scsi.h
│   │   │   ├── usb_slave_msc.c
│   │   │   └── usb_slave_msc.h
│   │   ├── mtp.c
│   │   └── uac.c
│   ├── gadget.c
│   ├── gadget.h
│   └── gadget_hal.c
├── hid                # hid 相关实现
│   ├── Class   
│   │   ├── Hid.c
│   │   ├── HidProtocol.c
│   │   ├── HidProtocol.h
│   │   ├── HidTransport.c
│   │   ├── HidTransport.h
│   │   └── Makefile
│   ├── Client        
│   │   ├── KeyBoard
│   │   │   ├── KeyBoard.c
│   │   │   ├── KeyBoard.h
│   │   │   └── Makefile
│   │   ├── Makefile
│   │   ├── Mouse
│   │   │   ├── Makefile
│   │   │   ├── UsbMouse.c
│   │   │   ├── UsbMouse.h
│   │   │   ├── UsbMouse_DriftControl.c
│   │   │   └── UsbMouse_DriftControl.h
│   │   └── misc_lib.c
│   ├── Include
│   │   ├── Hid.h
│   │   ├── HidFunDrv.h
│   │   ├── HidSpec.h
│   │   ├── Hid_i.h
│   │   └── misc_lib.h
│   └── Makefile
├── host               # Host 驱动
│   ├── Makefile
│   ├── ehci-hcd.c
│   ├── ehci-hub.c
│   ├── ehci-mem.c
│   ├── ehci-q.c
│   ├── ehci-sched.c
│   ├── ehci-sunxi.c
│   ├── ehci-timer.c
│   ├── ehci.h
│   ├── hci_hal.c
│   ├── ohci-hcd.c
│   ├── ohci-hub.c
│   ├── ohci-mem.c
│   ├── ohci-q.c
│   ├── ohci-sunxi.c
│   ├── ohci.h
│   ├── sunxi-hci.c
│   └── sunxi-hci.h
├── include
│   ├── audio.h
│   ├── bitops.h
│   ├── ch11.h
│   ├── ch9.h
│   ├── ehci_def.h
│   ├── endian.h
│   ├── error.h
│   ├── hcd.h
│   ├── mod_devicetable.h
│   ├── mod_usbhost.h
│   ├── storage.h
│   ├── usb.h
│   ├── usb_list.h
│   ├── usb_melis.h
│   ├── usb_os_platform.h
│   └── usb_rtos.h
├── manager           # usb 管理类
│   ├── Makefile
│   ├── sunxi_usb_board.h
│   ├── usb_hw_scan.c
│   ├── usb_hw_scan.h
│   ├── usb_manager.c
│   ├── usb_manager_common.h
│   ├── usb_msg_center.c
│   └── usb_msg_center.h
├── platform          # 芯片平台寄存器定义
│   ├── sun20iw2
│   │   ├── Makefile
│   │   ├── usb_sun20iw2.c
│   │   └── usb_sun20iw2.h
.   .   .
.   .   .
.   .   .
├── storage           # 存储器相关实现
│   ├── Class
│   │   ├── Makefile
│   │   ├── mscProtocol.c
│   │   ├── mscProtocol.h
│   │   ├── mscTransport.c
│   │   ├── mscTransport.h
│   │   ├── mscTransport_i.c
│   │   ├── msc_common.h
│   │   └── usb_msc.c
│   ├── Disk
│   │   ├── BlkDev.c
│   │   ├── BlkDev.h
│   │   ├── CD.c
│   │   ├── CD.h
│   │   ├── Disk.c
│   │   ├── LunMgr.c
│   │   ├── LunMgr_i.h
│   │   ├── Makefile
│   │   └── Scsi2.c
│   ├── Kconfig
│   ├── Makefile
│   ├── Misc
│   │   ├── Makefile
│   │   ├── usbh_buff_manager.c
│   │   ├── usbh_disk_info.c
│   │   └── usbh_disk_remove_time.c
│   └── include
│       ├── LunMgr.h
│       ├── Scsi2.h
│       ├── usb_msc.h
│       ├── usb_msc_i.h
│       ├── usbh_buff_manager.h
│       ├── usbh_disk_info.h
│       └── usbh_disk_remove_time.h
├── udc               # UDC 实现
│   ├── Makefile
│   ├── udc.c
│   ├── udc.h
│   ├── udc_hal.c
│   ├── udc_platform.h
│   ├── usb_dma.c
│   └── usb_dma.h
└── uvc                # UVC 实现
    ├── Class
    │   ├── Makefile
    │   ├── uvc.c
    │   ├── uvc_driver.c
    │   ├── uvc_driver.h
    │   ├── uvc_v4l2.c
    │   ├── uvc_video.c
    │   └── uvc_video.h
    ├── Include
    │   ├── UVC.h
    │   ├── assessibility.h
    │   ├── uvcvideo.h
    │   ├── video.h
    │   └── videodev2.h
    ├── Makefile
    ├── Misc
    │   ├── Makefile
    │   └── assessibility.c
    ├── Webcam
    │   ├── Makefile
    │   ├── usbWebcam.c
    │   ├── usbWebcam.h
    │   ├── usbWebcam_proc.c
    │   └── usbWebcam_proc.h
    └── drv_webcam
        ├── Makefile
        ├── dev_cfg
        │   ├── webcam_dev.c
        │   └── webcam_dev_i.h
        ├── drv_webcam.c
        ├── drv_webcam.h
        ├── drv_webcam_i.h
        ├── fb.h
        └── webcam_core
            ├── dev_webcam.c
            ├── dev_webcam_i.h
            ├── webcam_linklist_manager.c
            └── webcam_linklist_manager.h
```

## 模块接口说明

头文件

```c
#include <sunxi_hal_usb.h>
#include <usb_os_platform.h>
```

### UDC 回调事件结构体

```c
typedef enum {
	UDC_EVENT_RX_STANDARD_REQUEST = 1,
	UDC_EVENT_RX_CLASS_REQUEST = 2,
	UDC_EVENT_RX_DATA = 3,
	UDC_EVENT_TX_COMPLETE = 4,
} udc_callback_event_t;
```

 ### UDC 错误返回枚举

```c
typedef enum {
	UDC_ERRNO_SUCCESS = 0,
	UDC_ERRNO_CMD_NOT_SUPPORTED = -1,
	UDC_ERRNO_CMD_INVALID = -2,
	UDC_ERRNO_BUF_NULL = -3,
	UDC_ERRNO_BUF_FULL = -4,
	UDC_ERRNO_EP_INVALID = -5,
	UDC_ERRNO_RX_NOT_READY = -6,
	UDC_ERRNO_TX_BUSY = -7,
} udc_errno_t;
```

### USB 驱动初始化

函数原型

```c
void sunxi_usb_init(void);
```

参数：

- 无

返回值：

- 无



### USB HOST 初始化

函数原型

```c
int hal_usb_core_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB HOST 去初始化

函数原型

```c
int hal_usb_core_exit(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB HOST 加载所有主机驱动（除了0）

函数原型

```c
int hal_usb_hci_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB HOST 去加载所有主机驱动（除了0）

函数原型

```c
int hal_usb_hci_deinit(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB HOST 加载指定主机驱动

函数原型

```c
int hal_usb_hcd_init(int hci_num);
```

参数：

- hci_num：指定主机驱动

返回值：

- 0：成功
- 负数：失败



### USB HOST 去加载指定主机驱动

函数原型

```c
int hal_usb_hcd_deinit(int hci_num);
```

参数：

- hci_num：指定主机驱动

返回值：

- 0：成功
- 负数：失败



### USB HOST PHY 区域显示

函数原型

```c
void hal_hci_phy_range_show(int hci_num);
```

参数：

- hci_num：指定主机驱动

返回值：

- 无



### USB HOST PHY 配置区域

函数原型

```c
void hal_hci_phy_range_set(int hci_num, int val);
```

参数：

- hci_num：指定主机驱动
- val：配置的值

返回值：

- 无



### USB HOST 显示驱动能力

函数原型

```c
void hal_hci_driverlevel_show(int hci_num);
```

参数：

- hci_num：指定主机驱动

返回值：

- 无



### USB HOST 配置驱动能力

函数原型

```c
void hal_hci_driverlevel_adjust(int hci_num, int driverlevel);
```

参数：

- hci_num：指定主机驱动
- driverlevel：配置的驱动能力

返回值：

- 无



### USB HOST 眼图测试

函数原型

```c
void hal_hci_ed_test(int hci_num, const char *buf, unsigned int count);
```

参数：

- hci_num：指定主机驱动
- buf：传输的数据
- count：数据长度

返回值：

- 无



### USB UDC 初始化

函数原型

```c
int32_t hal_udc_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB UDC 去初始化

函数原型

```c
int32_t hal_udc_deinit(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败



### USB UDC EP 读操作

函数原型

```c
int32_t hal_udc_ep_read(uint8_t ep_addr, void *buf, uint32_t len);
```

参数：

- ep_addr：ep地址
- buf：读取的数据指针
- len：读取长度

返回值：

- 0：成功
- 负数：失败



### USB UDC EP 写操作

函数原型

```c
int32_t hal_udc_ep_write(uint8_t ep_addr, void *buf , uint32_t len);
```

参数：

- ep_addr：ep地址
- buf：读取的数据指针
- len：读取长度

返回值：

- 0：成功
- 负数：失败



### USB UDC 初始化设备描述符

函数原型

```c
void hal_udc_device_desc_init(void *device_desc);
```

参数：

- device_desc：设备描述符数据

返回值：

- 无



### USB UDC 配置描述符初始化

函数原型

```c
void hal_udc_config_desc_init(void *config_desc, uint32_t len);
```

参数：

- config_desc：配置描述符指针
- len：长度

返回值：

- 无



### USB UDC 字符串描述符初始化

函数原型

```c
void hal_udc_string_desc_init(const void *string_desc);
```

参数：

- string_desc：配置字符串描述符的指针

返回值：

- 无



### USB UDC 注册回调函数

函数原型

```c
void hal_udc_register_callback(udc_callback_t user_callback);
```

参数：

- user_callback：回调函数

返回值：

- 无



### USB UDC 禁用 EP

函数原型

```c
void hal_udc_ep_disable(uint8_t ep_addr);
```

参数：

- ep_addr：地址

返回值：

- 无



### USB UDC 启用 EP

函数原型

```c
void hal_udc_ep_enable(uint8_t ep_addr, uint16_t maxpacket, uint32_t ts_type);
```

参数：

- ep_addr：地址
- maxpacket：最大包大小
- ts_type：模式

返回值：

- 无



### USB UDC 设置 EP 发送/接收 buffer

函数原型

```c
void hal_udc_ep_set_buf(uint8_t ep_addr, void *buf, uint32_t len);
```

参数：

- ep_addr：地址
- buf：buf的指针
- len：buf的长度

返回值：

- 无



### USB UDC 显示驱动能力

函数原型

```c
void hal_udc_driverlevel_show(void);
```

参数：

- 无

返回值：

- 无



### USB UDC 调整驱动能力

函数原型

```c
void hal_udc_driverlevel_adjust(int driverlevel);
```

参数：

- driverlevel：驱动能力

返回值：

- 无



### USB UDC 显示范围

函数原型

```c
void hal_udc_phy_range_show(int usbc_num);
```

参数：

- usbc_num：usb控制器号

返回值：

- 无



### USB UDC 配置范围

函数原型

```c
void hal_udc_phy_range_set(int usbc_num, int val);
```

参数：

- usbc_num：usb控制器号
- val：值

返回值：

- 无



### USB UDC 眼图测试

函数原型

```c
void hal_udc_ed_test(const char *buf, size_t count);
```

参数：

- buf：测试使用的buf
- count：数量

返回值：

- 无

### USB Manager 初始化

函数原型

```c
int hal_usb_manager_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

### USB Manager 去初始化

函数原型

```c
int hal_usb_manager_deinit(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

### USB Gadget 初始化

函数原型

```c
int hal_gadget_init(void);
```

参数：

- 无

返回值：

- 0：成功
- 负数：失败

### USB Gadget 去初始化

函数原型

```c
void hal_gadget_exit(void);
```

参数：

- 无

返回值：

- 无

### USB Gadget 启用功能

函数原型

```c
int usb_gadget_function_enable(const char *name);
```

参数：

- name：功能名

返回值：

- 0：成功
- 负数：失败

### USB Gadget 禁用功能

函数原型

```c
int usb_gadget_function_disable(const char *name);
```

参数：

- name：功能名

返回值：

- 0：成功
- 负数：失败

### USB Gadget 读取

函数原型

```c
int usb_gadget_function_read(int ep_idx, char *buf, int size);
```

参数：

- ep_idx：端点号
- buf：buf指针
- size：buf的大小

返回值：

- 0：成功
- 负数：失败

### USB Gadget 限时读取

函数原型

```c
int usb_gadget_function_read_timeout(int ep_idx, char *buf, int size, int ms);
```

参数：

- ep_idx：端点号
- buf：buf指针
- size：buf的大小
- ms：超时时间

返回值：

- 0：成功
- 负数：失败

### USB Gadget 写数据

函数原型

```c
int usb_gadget_function_write(int ep_idx, char *buf, int size);
```

参数：

- ep_idx：端点号
- buf：buf指针
- size：buf的大小

返回值：

- 0：成功
- 负数：失败

### USB Gadget 写字符串

函数原型

```c
int usb_gadget_function_string_set(char *name, char *str, unsigned int idx);
```

参数：

- name：名称
- str：字符串指针
- idx：端点号

返回值：

- 0：成功
- 负数：失败

## 模块使用范例

### 测试用例公共头文件

`usb_test.h`

```c
#ifndef USB_TEST_H
#define USB_TEST_H

#include <sunxi_hal_usb.h>
#include <usb_os_platform.h>

#ifdef __cplusplus
extern "C" {
#endif

int usb_test_cmd_hci(int argc, const char **argv);
int usb_test_cmd_udc(int argc, const char **argv);
int usb_test_cmd_phy_range(int argc, const char **argv);
int usb_test_cmd_ed_test(int argc, const char **argv);
int usb_test_cmd_debug(int argc, const char **argv);
int usb_test_cmd_uvc(int argc, const char **argv);


int usb_test_is_otg(int port);
int usb_test_get_port(const char *buf, int *port);
void usb_test_show_help(void);

unsigned char usb_core_is_enabled(void);
unsigned char sunxi_ehci_status_get(void);

#ifdef __cplusplus
}
#endif

#endif // USB_TEST_H
```

### HCI 测试实现实现

```c
#include "usb_test.h"

int usb_test_cmd_hci(int argc, const char **argv)
{
	int c;
	int hci_num = 0;
	unsigned int port = 0;

	if (argc == 4) {
		// insmod/rmmod indicate host driver
		if (usb_test_get_port(argv[3], &port))
			return 0;
	} else if (argc == 3) {
		// insmod/rmmod all host driver
		port = 0xffff;
	} else
		return -1;

	while ((c = getopt(argc, (char *const *)argv, "ir")) != -1) {
		switch (c) {
		case 'i':
#ifdef CONFIG_HAL_TEST_UDC
			/*otg mode rmmod device driver before insmod hci*/
			if (usb_test_is_otg(port)) {
				printf("[usb0] rmmod device driver!\n");
				hal_gadget_exit();
			}
#endif
			if (!usb_core_is_enabled())
				hal_usb_core_init();

			if (port == 0xffff)
				for (hci_num = 0; hci_num < USB_MAX_CONTROLLER_COUNT; hci_num++)
					hal_usb_hcd_init(hci_num);
			else
				hal_usb_hcd_init(port);
			break;
		case 'r':
			if (port == 0xffff)
				for (hci_num = 0; hci_num < USB_MAX_CONTROLLER_COUNT; hci_num++)
					hal_usb_hcd_deinit(hci_num);
			else
				hal_usb_hcd_deinit(port);

			if (usb_core_is_enabled() && !sunxi_ehci_status_get())
				hal_usb_core_exit();
			break;
		default:
			printf("ERR: insmod/rmmod error!\n");
			usb_test_show_help();
			break;
		}
	}

	return 0;
}

int usb_test_cmd_debug(int argc, const char **argv)
{
	int enable = 0;

	if (argc != 3)
		return -1;

	enable = atoi(argv[2]);
	if (enable == 1 || enable == 0) {
		hal_usb_hcd_debug_set(enable);
		printf("USB debug %s!\n", hal_usb_hcd_debug_get() ? "open" : "close");
		return 0;
	}
	
	return -1;
}
```

### MSG 测试用例实现

```c
#include <inttypes.h>

#include "usb.h"
#include "ch9.h"
#include "storage.h"
#include "usb_os_platform.h"


struct usb_msg_dev {
	uint8_t max_lun;
	uint8_t cbw[32];
};

static struct usb_device_descriptor demo_device_desc = {
	.bLength = USB_DT_DEVICE_SIZE,
	.bDescriptorType = USB_DT_DEVICE,
	.bcdUSB = 0x0200,
	.bDeviceClass = 0,
	.bDeviceSubClass = 0,
	.bDeviceProtocol = 0,
	.bMaxPacketSize0 = 64,
	.idVendor = 0x18d1,
	.idProduct = 0x0001,
	.bcdDevice = 0x0001,
	.iManufacturer = 0x01,
	.iProduct = 0x02,
	.iSerialNumber = 0x03,
	.bNumConfigurations = 1
};

static struct usb_config_descriptor demo_config_desc = {
	.bLength = USB_DT_CONFIG_SIZE,
	.bDescriptorType = USB_DT_CONFIG,
	.wTotalLength = 32, /* FIXME */
	.bNumInterfaces = 1,
	.bConfigurationValue = 1,
	.iConfiguration = 0,
	.bmAttributes = 0x80,
	.bMaxPower = 0x64 /* 200mA */
};

static struct usb_interface_descriptor demo_intf_desc = {
	.bLength = USB_DT_INTERFACE_SIZE,
	.bDescriptorType = USB_DT_INTERFACE,
	.bInterfaceNumber = 0x0,
	.bAlternateSetting = 0x0,
	.bNumEndpoints = 2,
	.bInterfaceClass = 0x08, /* Mass Storage class */
	.bInterfaceSubClass = 0x06, /* SCSI Transparent Subclass */
	.bInterfaceProtocol = 0x50, /* Bulk-Only Protocol */
	.iInterface = 0
};

static struct usb_endpoint_descriptor demo_ep_bulk_out = {
	.bLength = USB_DT_ENDPOINT_SIZE,
	.bDescriptorType = USB_DT_ENDPOINT,
	.bEndpointAddress = 0x1 | USB_DIR_OUT,
	.bmAttributes = USB_ENDPOINT_XFER_BULK,
	.wMaxPacketSize = 0x0200, /* 512 Bytes */
	.bInterval = 0
};

static struct usb_endpoint_descriptor demo_ep_bulk_in = {
	.bLength = USB_DT_ENDPOINT_SIZE,
	.bDescriptorType = USB_DT_ENDPOINT,
	.bEndpointAddress = 0x1 | USB_DIR_IN,
	.bmAttributes = USB_ENDPOINT_XFER_BULK,
	.wMaxPacketSize = 0x0200, /* 512 Bytes */
	.bInterval = 0
};

/*
 * String descriptors
 */
static const uint16_t g_str_lang_id[] = {
	0x0304, 0x0409
};

static const uint16_t g_str_manufacturer[] = {
	0x030e, 'G', 'o', 'o', 'g', 'l', 'e'
};

static const uint16_t g_str_product[] = {
	0x0308, 'M', 's', 'g'
};

static const uint16_t g_str_serialnumber[] = {
	0x0314, '2', '0', '0', '8', '0', '4', '1', '1'
};

struct usb_msg_dev g_msg_dev = {
	.max_lun = 0,
};

static void *g_config_desc = NULL;

void usb_msg_desc_init(void)
{
	uint32_t config_desc_len;
	void *buf;

	config_desc_len = demo_config_desc.bLength + demo_intf_desc.bLength
			+ demo_ep_bulk_out.bLength + demo_ep_bulk_in.bLength;

	g_config_desc = malloc(config_desc_len);

	/* compose configuation, interface and endpoint descriptors */
	buf = g_config_desc;
	memcpy(buf, &demo_config_desc, demo_config_desc.bLength);
	buf += demo_config_desc.bLength;
	memcpy(buf, &demo_intf_desc, demo_intf_desc.bLength);
	buf += demo_intf_desc.bLength;
	memcpy(buf, &demo_ep_bulk_out, demo_ep_bulk_out.bLength);
	buf += demo_ep_bulk_out.bLength;
	memcpy(buf, &demo_ep_bulk_in, demo_ep_bulk_in.bLength);

	hal_udc_device_desc_init(&demo_device_desc);
	hal_udc_config_desc_init(g_config_desc, config_desc_len);
	/* FIXME: string descriptors must be initialized in the following order now */
	hal_udc_string_desc_init(g_str_lang_id);
	hal_udc_string_desc_init(g_str_manufacturer);
	hal_udc_string_desc_init(g_str_product);
	hal_udc_string_desc_init(g_str_serialnumber);
}

static void usb_msg_ep_init(void)
{
	hal_log_info("usb demo ep init...\n");

	/* init bulk-in ep */
	hal_udc_ep_enable(demo_ep_bulk_in.bEndpointAddress,
			demo_ep_bulk_in.wMaxPacketSize,
			demo_ep_bulk_in.bmAttributes & USB_ENDPOINT_XFERTYPE_MASK);

	/* initialise bulk-out ep buf in order to get the first CBW */
	hal_udc_ep_set_buf(demo_ep_bulk_out.bEndpointAddress,
			g_msg_dev.cbw,
			sizeof(g_msg_dev.cbw));

	/* init bulk-out ep */
	hal_udc_ep_enable(demo_ep_bulk_out.bEndpointAddress,
			demo_ep_bulk_out.wMaxPacketSize,
			demo_ep_bulk_out.bmAttributes & USB_ENDPOINT_XFERTYPE_MASK);
}

static udc_errno_t usb_msg_class_request_handler(struct usb_ctrlrequest *crq)
{
	udc_errno_t ret = UDC_ERRNO_SUCCESS;

	switch(crq->bRequest) {
	case US_BULK_RESET_REQUEST:
		/* TODO */
		break;
	case US_BULK_GET_MAX_LUN:
		hal_log_info("get MAX_LUN\r\n");

		if (crq->bRequestType !=
				(USB_DIR_IN | USB_TYPE_CLASS | USB_RECIP_INTERFACE)) {
			ret = UDC_ERRNO_CMD_INVALID;
			break;
		}
		/* FIXME: a fake response for demo */
		hal_udc_ep_write(0, &g_msg_dev.max_lun, sizeof(g_msg_dev.max_lun));
		break;
	default:
		ret = UDC_ERRNO_CMD_INVALID;
		break;
	}

	return ret;
}

static udc_errno_t usb_msg_standard_request_handler(struct usb_ctrlrequest *crq)
{
	udc_errno_t ret = UDC_ERRNO_SUCCESS;

	switch (crq->bRequest) {
	case USB_REQ_SET_CONFIGURATION:
		/* FIXME: usb msg driver should be independent of demo code */
		usb_msg_ep_init();
		break;
	default:
		ret = UDC_ERRNO_CMD_INVALID;
		break;
	}

	return ret;
}

static udc_errno_t usb_msg_scsi_cmd_handler(struct bulk_cb_wrap *cbw)
{
	udc_errno_t ret = UDC_ERRNO_SUCCESS;
	uint8_t opcode = cbw->CDB[0];
	uint8_t fake_rsp[36] = {0x00, 0x80, 0x02, 0x02, 0x1F, 0x00, 0x00,
			0x00, 0x54, 0x69, 0x6e, 0x61, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20, 0x20,
			0x20, 0x20, 0x20, 0x20, 0x20};

	hal_log_info("scsi cmd opcode: 0x%x\n", opcode);

	switch (opcode) {
	case 0x12: /* INQUIRY */
		/* FIXME: a fake response for demo */
		hal_udc_ep_write(demo_ep_bulk_in.bEndpointAddress, fake_rsp, sizeof(fake_rsp));
		break;
	default:
		ret = UDC_ERRNO_CMD_INVALID;
		break;
	}

	return ret;
}

udc_errno_t usb_msg_callback(uint8_t ep_addr, udc_callback_event_t event, void *data, uint32_t len)
{
	uint8_t ep_idx;
	uint8_t is_in;
	udc_errno_t ret = UDC_ERRNO_SUCCESS;
	struct usb_ctrlrequest *crq;
	struct bulk_cb_wrap *cbw;

	hal_log_info("usb_msg_callback event: %"PRIu32", len: %"PRIu32"\n", event, len);

	ep_idx = ep_addr & 0x7f;
	is_in = ep_addr & USB_DIR_IN;

	if (ep_idx == 0) { /* handle ep0 */
		crq = (struct usb_ctrlrequest *)data;

		switch (event) {
		case UDC_EVENT_RX_STANDARD_REQUEST:
			ret = usb_msg_standard_request_handler(crq);
			break;
		case UDC_EVENT_RX_CLASS_REQUEST:
			ret = usb_msg_class_request_handler(crq);
			break;
		default:
			ret = UDC_ERRNO_CMD_NOT_SUPPORTED;
			break;
		}
	} else { /* handle ep1~4 */
		if (is_in) {
			/* TODO: maybe useless? */
		} else {
			cbw = (struct bulk_cb_wrap *)data;

			switch (event) {
			case UDC_EVENT_RX_DATA:
				usb_msg_scsi_cmd_handler(cbw);
				break;
			default:
				ret = UDC_ERRNO_CMD_NOT_SUPPORTED;
				break;
			}
		}
	}

	return ret;
}
```

### PHY 驱动测试实现

```c
#include "usb_test.h"

static void __usb_ed_test(int port, const char *buf)
{
	if (usb_test_is_otg(port)) { /*otg mode*/
#ifdef CONFIG_HAL_TEST_UDC
		hal_udc_ed_test(buf, strlen(buf));
#else
		printf("ERR: udc config not find!\n");
#endif

	} else {
#ifdef CONFIG_HAL_TEST_HCI
		hal_hci_ed_test(port, buf, strlen(buf));
#else
		printf("ERR: hci config not find!\n");
#endif
	}
}

static void __phy_range_set(int port, int val)
{
	if (usb_test_is_otg(port)) { /*otg mode*/
#ifdef CONFIG_HAL_TEST_UDC
		hal_udc_phy_range_set(port, val);
#else
		printf("ERR: udc config not find!\n");
#endif
	} else {
#ifdef CONFIG_HAL_TEST_HCI
		hal_hci_phy_range_set(port, val);
#else
		printf("ERR: hci config not find!\n");
#endif
	}
}

static void __phy_range_show(int port)
{
	if (usb_test_is_otg(port)) { /*otg mode*/
#ifdef CONFIG_HAL_TEST_UDC
		hal_udc_phy_range_show(port);
#else
		printf("ERR: udc config not find!\n");
#endif
	} else {
#ifdef CONFIG_HAL_TEST_HCI
		hal_hci_phy_range_show(port);
#else
		printf("ERR: hci config not find!\n");
#endif
	}
}


int usb_test_cmd_ed_test(int argc, const char **argv)
{
	int port = 0;

	if (argc != 4)
		return -1;

	if (usb_test_get_port(argv[2], &port))
		return 0;

	__usb_ed_test(port, argv[3]);
	return 0;
}

int usb_test_cmd_phy_range(int argc, const char **argv)
{
	int c;
	int val;
	int port;

	if ((argc != 4) && (argc != 5))
		return -1;

	if (usb_test_get_port(argv[3], &port))
		return 0;

	if (usb_test_is_otg(port)) {
		printf("\nOTG%d phy range\n", port);
	} else
		printf("\nEHCI%d phy range\n", port);

	while ((c = getopt(argc, (char *const *)argv, "sg")) != -1) {
		switch (c) {
		case 's':
			if(argc == 5)
				val = strtol(argv[4], NULL, 16);
			else
				return -1;

			__phy_range_set(port, val);
			break;
		case 'g':
			__phy_range_show(port);
			break;
		default:
			printf("ERR: phy_range cmd error!\n");
			usb_test_show_help();
			break;
		}
	}
	return 0;
}
```

### USB UDC 测试用例实现

```c
#include "usb_test.h"

int usb_test_cmd_udc(int argc, const char **argv)
{
	int c;
	if ((argc != 3) && (argc != 4))
		return -1;

	while ((c = getopt(argc, (char *const *)argv, "ir")) != -1) {
		switch (c) {
		case 'i':
#ifdef CONFIG_HAL_TEST_HCI
			// rmmod host driver before insmod otg
			if (usb_test_is_otg(0) == 0) /*hci mode*/
				hal_usb_hcd_deinit(0);
#endif
			printf("[usb0] insmod device driver!\n");
			hal_gadget_init();
			break;
		case 'r':
			printf("[usb0] rmmod device driver!\n");
			hal_gadget_exit();
			break;
		default:
			printf("err: insmod/rmmod error!\n");
			usb_test_show_help();
			break;
		}
	}

	return 0;
}
```

 ### USB UVC 测试用例实现

```c
#include <sys/ioctl.h>
#include <fcntl.h>

#include "usb_test.h"
#include "uvcvideo.h"

static int save_frame_to_file(void *str, void *start, int length)
{
	FILE *fp = NULL;

	fp = fopen(str, "wb+"); //save more frames
	if (!fp) {
		printf(" Open %s error\n", (char *)str);

		return -1;
	}

	if (fwrite(start, length, 1, fp)) {
		fclose(fp);

		return 0;
	} else {
		printf(" Write file fail (%s)\n", strerror(errno));
		fclose(fp);

		return -1;
	}

	return 0;
}

int usb_test_cmd_uvc(int argc, const char **argv)
{
	int fd;
	struct v4l2_capability cap;      /* Query device capabilities */
	struct v4l2_streamparm parms;    /* set streaming parameters */
	struct v4l2_format fmt;          /* try a format */
	struct v4l2_requestbuffers req;  /* Initiate Memory Mapping or User Pointer I/O */
	struct v4l2_buffer buf;          /* Query the status of a buffer */
	enum v4l2_buf_type type;
	int n_buffers;
	char source_data_path[64];
	int np;

	/* 1.open /dev/videoX node */
	fd = open("/dev/video", O_RDWR);

	/* 2.Query device capabilities */
	memset(&cap, 0, sizeof(cap));
	if (ioctl(fd, VIDIOC_QUERYCAP, &cap) < 0) {
		printf(" Query device capabilities fail!!!\n");
	} else {
		printf(" Querey device capabilities succeed\n");
		printf(" cap.driver=%s\n", cap.driver);
		printf(" cap.card=%s\n", cap.card);
		printf(" cap.bus_info=%s\n", cap.bus_info);
		printf(" cap.version=0x%08x\n", cap.version);
		printf(" cap.capabilities=0x%08x\n", cap.capabilities);
	}

	/* 7.set streaming parameters */
	memset(&parms, 0, sizeof(struct v4l2_streamparm));
	parms.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	parms.parm.capture.timeperframe.numerator = 1;
	parms.parm.capture.timeperframe.denominator = 30;
	if (ioctl(fd, VIDIOC_S_PARM, &parms) < 0) {
		printf(" Setting streaming parameters failed, numerator:%d denominator:%d\n",
			   parms.parm.capture.timeperframe.numerator,
			   parms.parm.capture.timeperframe.denominator);
		close(fd);
		return -1;
	}

	/* 9.set the data format */
	memset(&fmt, 0, sizeof(struct v4l2_format));
	fmt.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	fmt.fmt.pix.width = 1280;
	fmt.fmt.pix.height = 720;
	fmt.fmt.pix.pixelformat = V4L2_PIX_FMT_MJPEG;
	fmt.fmt.pix.field = V4L2_FIELD_INTERLACED;

	if (ioctl(fd, VIDIOC_S_FMT, &fmt) < 0) {
		printf(" setting the data format failed!\n");
		close(fd);
		return -1;
	}

	/* 10.Initiate Memory Mapping or User Pointer I/O */
	memset(&req, 0, sizeof(struct v4l2_requestbuffers));
	req.count = 3;
	req.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	req.memory = V4L2_MEMORY_MMAP;
	if (ioctl(fd, VIDIOC_REQBUFS, &req) < 0) {
		printf(" VIDIOC_REQBUFS failed\n");
		close(fd);
		return -1;
	}

	/* 11.Exchange a buffer with the driver */
	for (n_buffers = 0; n_buffers < req.count; n_buffers++) {
		memset(&buf, 0, sizeof(struct v4l2_buffer));

		buf.index = n_buffers;
		if (ioctl(fd, VIDIOC_QBUF, &buf) == -1) {
			printf(" VIDIOC_QBUF error\n");

			close(fd);
			return -1;
		}
	}

	/* streamon */
	type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	if (ioctl(fd, VIDIOC_STREAMON, &type) == -1) {
		printf(" VIDIOC_STREAMON error! %s\n", strerror(errno));
	} else
		printf(" stream on succeed\n");

	np = 0;
	while (np < 5) {
		printf(" camera capture num is [%d]\n", np);

		/* wait uvc frame */
		memset(&buf, 0, sizeof(struct v4l2_buffer));

		if (ioctl(fd, VIDIOC_DQBUF, &buf) == -1) {
			printf(" VIDIOC_DQBUF error\n");

			goto EXIT;
		} else
			printf("*****DQBUF[%d] FINISH*****\n", buf.index);

		sprintf(source_data_path, "/data/source_frame_%d.jpg", np);
		save_frame_to_file(source_data_path, (void *)buf.mem_buf, buf.length);

		if (ioctl(fd, VIDIOC_QBUF, &buf) == -1) {
			printf(" VIDIOC_QBUF error\n");

			goto EXIT;
		} else
			printf("************QBUF[%d] FINISH**************\n\n", buf.index);

		np++;
	}

	printf("\n\n Capture thread finish\n");

EXIT:
	type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	ioctl(fd, VIDIOC_STREAMOFF, &type);

	memset(&req, 0, sizeof(struct v4l2_requestbuffers));
	req.count = 0;
	req.type = V4L2_BUF_TYPE_VIDEO_CAPTURE;
	req.memory = V4L2_MEMORY_MMAP;
	ioctl(fd, VIDIOC_REQBUFS, &req);

	close(fd);

	return 0;
}
```

### USB 测试用例

```c
#include "usb_test.h"

void usb_test_show_help(void)
{
	printf("\nUsage:\n"\
		"\tusb hci {-i|-r} [<port>]\n"\
		"\tusb udc {-i|-r} [<port>]\n"\
		"\tusb phy_range {-s|-g} {<port>} [<phyrange>]\n"\
		"\tusb ed_test {<port>} {<type>}\n"\
		"\tusb debug {<status>}\n"\
		"\tusb uvc_test\n"\
		"\n\t- - - - - - - - - - - - - - - - - - - - -\n"\
		"Meaning:\n"\
		"\t-i:insmod, -r:rmmod, -s:set, -g:get\n"\
		"\n"\
		"\tport     : [0-%d],port number\n"\
		"\tphyrange : [0x0-0x1f],phy range\n"\
		"\tstatus   : [0-disable,1-enable],hci debug status\n"\
		"\ttype     : [test_j_state/test_k_state/test_se0_nak/test_pack]--hci & otg\n"\
		"\t           [test_not_operating/test_force_enable/test_mask]--hci only\n"\
		"\n\t==>> More information refer to spec <<==\n",
		USB_MAX_CONTROLLER_COUNT - 1);
}

int usb_test_is_otg(int port)
{
#if defined(CONFIG_HAL_TEST_HCI)
	if (port == 0 && !(sunxi_ehci_status_get() & 0x1)) /*otg mode*/
#else
	if (port == 0)
#endif
		return 1;
	else
		return 0;
}

int usb_test_get_port(const char *buf, int *port)
{
	*port = atoi(buf);
	if (*port > USB_MAX_CONTROLLER_COUNT - 1) {
		printf("ERR: port(%d) choose error! Port range [0-%d]\n", *port,
			USB_MAX_CONTROLLER_COUNT - 1);
		return -1;
	}

	return 0;
}

static int usb_test_command_hci(int argc, const char **argv)
{
#if defined(CONFIG_HAL_TEST_HCI)
	return usb_test_cmd_hci(argc, argv);
#else
	printf("ERR: Can't find command config!\n");
	return -1;
#endif
}

static int usb_test_command_udc(int argc, const char **argv)
{
#if defined(CONFIG_HAL_TEST_UDC)
	return usb_test_cmd_udc(argc, argv);
#else
	printf("ERR: Can't find command config!\n");
	return -1;
#endif
}

static int usb_test_command_phy_range(int argc, const char **argv)
{
	return usb_test_cmd_phy_range(argc, argv);
}

static int usb_test_command_ed_test(int argc, const char **argv)
{
	return usb_test_cmd_ed_test(argc, argv);
}

static int usb_test_command_debug(int argc, const char **argv)
{
#if defined(CONFIG_HAL_TEST_HCI)
	return usb_test_cmd_debug(argc, argv);
#else
	printf("ERR: Can't find command config!\n");
	return -1;
#endif
}

static int usb_test_command_uvc(int argc, const char **argv)
{
#if defined(CONFIG_HAL_TEST_UVC)
	// return usb_test_cmd_uvc(argc, argv);
	usb_test_cmd_uvc(argc, argv);/* -1 has other meaning in this case*/
	return 0;
#else
	printf("ERR: Can't find command config!\n");
	return -1;
#endif
}

static int usb_test_command(int argc, const char **argv)
{
	int ret = -1;
	if (argc < 2) {
		printf("ERR: command error\n");
		usb_test_show_help();
		return -1;
	}

	if (!strcmp(argv[1], "hci"))
		ret = usb_test_command_hci(argc, argv);
	else if (!strcmp(argv[1], "udc"))
		ret = usb_test_command_udc(argc, argv);
	else if (!strcmp(argv[1], "phy_range"))
		ret = usb_test_command_phy_range(argc, argv);
	else if (!strcmp(argv[1], "ed_test"))
		ret = usb_test_command_ed_test(argc, argv);
	else if (!strcmp(argv[1], "debug"))
		ret = usb_test_command_debug(argc, argv);
	else if (!strcmp(argv[1], "uvc_test"))
		ret = usb_test_command_uvc(argc, argv);


	if (ret == 0)
		return 0;

	usb_test_show_help();
	return -1;
}

FINSH_FUNCTION_EXPORT_CMD(usb_test_command, usb, usb tests)
```

