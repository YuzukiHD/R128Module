# LVGL 与 SPI TFT GUI

本次使用的是 Dshan_Display Module，如下图：

![img](assets/post/lvgl_spi/O1CN01EnnPfh1adisHYyi4d_!!0-item_pic.jpg_Q75.jpg_.webp)

引脚配置如下：

| R128 Devkit | TFT 模块 |
| ----------- | -------- |
| PA12        | CS       |
| PA13        | SCK      |
| PA18        | MOSI     |
| PA9         | PWM      |
| PA20        | RESET    |
| PA19        | RS       |
| 3V3         | 3.3V     |
| GND         | GND      |

![image-20230825143934156](assets/post/lvgl_spi/image-20230825143934156.png)

## 载入方案

我们使用的开发板是 R128-Devkit，需要开发 C906 核心的应用程序，所以载入方案选择 `r128s2_module_c906`

```bash
$ source envsetup.sh 
$ lunch_rtos 1
```

![image-20230802110150203](assets/post/lvgl_spi/image-20230802110150203.png)

## 配置 SPI LCD 驱动

驱动配置请参照 《SPI 驱动 TFT LCD 屏》文章进行配置。

## 配置 LVGL 软件包

运行 `mrtos_menuconfig` 进入配置页面。在如下地址找到勾选相关软件包。

```
System components  --->
	thirdparty components  --->
		[*] Littlevgl-8  --->
			[*]   lvgl examples
			[*]   lvgl-8.1.0 use sunxifb double buffer
			[*]   lvgl-8.1.0 use sunxifb cache
```

![image-20230825153504625](assets/post/lvgl_spi/image-20230825153504625.png)

## 修改 LVGL 显示配置

进入 `lichee/rtos-components/thirdparty/littlevgl-8/lv_examples/src/lv_conf.h` 找到 `LV_COLOR_DEPTH` 并修改为 16 位，`LV_COLOR_16_SWAP` 置为 1 进行红蓝颜色交换。

![image-20230825153629754](assets/post/lvgl_spi/image-20230825153629754.png)

## 测试

编译打包刷写后，在控制台输入 `lv_examples`  可以查看相关命令。

![image-20230825153901829](assets/post/lvgl_spi/image-20230825153901829.png)

运行 `lv_examples 1` 即可在屏幕显示 LVGL 界面。

![image-20230825153927629](assets/post/lvgl_spi/image-20230825153927629.png)

![image-20230825154036301](assets/post/lvgl_spi/image-20230825154036301.png)
