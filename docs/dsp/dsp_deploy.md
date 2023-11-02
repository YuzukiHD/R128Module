# HiFi5 语音算法部署

部署算法需要完成以下四个方面的功能：

1. 创建DSP算法组件目录及编写代码
2. 在DSP上录音
3. 使用算法加速库加速算法
4. 核间通讯
5. dump数据到PC

## 创建DSP算法组件目录

创建并进入目录：

```
mkdir -p lichee/rtos-components/thirdparty/my_dsp_asr/src
mkdir -p lichee/rtos-components/thirdparty/my_dsp_asr/inc
cd lichee/rtos-components/thirdparty/my_dsp_asr/
```

编写 `Kconfig` 文件：

```Kconfig
menu "my dsp asr"

config COMPONENTS_MY_DSP_ASR
    bool "my dsp asr"
    depends on ARCH_DSP
    default n
    help
        to do

endmenu
```

修改 `Kconfig `后建议重新 `menuconfig`

在 `lichee/rtos-components/thirdparty/Kconfig` 中追加：

```Kconfig
source "components/common/thirdparty/my_dsp_asr/Kconfig"
```

编写 `Makefile`：

```
obj-y += src/my_dsp_asr.o
#self
CFLAGS += -Icomponents/common/aw/asr_demo/inc/
```

在 `lichee/rtos-components/thirdparty/Makefile` 中追加：

```
obj-$(CONFIG_COMPONENTS_MY_DSP_ASR) += my_dsp_asr/
```

## 编写基础代码

```c
#include <stdio.h>
#include <stdint.h>
#include <stddef.h>
#include <string.h>
#include <console.h>
#include <FreeRTOS.h>
#include <task.h>

static void my_dsp_asr_thread(void *arg)
{
    size_t loop = (size_t)arg;

    printf("%s enter\n", __func__);
    while (loop--) {
        printf("%s %u\n", __func__, loop);
        vTaskDelay(500 / portTICK_PERIOD_MS);
    }
    printf("%s exit\n", __func__);

    vTaskDelete(NULL);
}

const char *thread_name = "my_dsp_asr_thread";
size_t stack_size = 0x4000;
size_t thread_priority = 1;
int cmd_my_dsp_asr(int argc, char *argv[])
{
    size_t loop = 10;
    TaskHandle_t handle = NULL;

    printf("%s enter\n", __func__);
    if(xTaskCreate(my_dsp_asr_thread, thread_name, stack_size, (void *)loop, thread_priority, &handle) != pdPASS) {
        printf("xTaskCreate %s failed!\n", thread_name);
    }
    printf("%s exit\n", __func__);

    return 0;
}
FINSH_FUNCTION_EXPORT_CMD(cmd_my_dsp_asr, my_dsp_asr, my dsp asr);

```

`./build.sh menuconfig`，选择以下配置：

```
CONFIG_COMPONENTS_MY_DSP_ASR
```

（会根据 `Kconfig` 的 `select` 字段自动选上依赖的组件）

检查是否编译进固件：

```
grep -r cmd_my_dsp_asr ./out/ --include=*.bin
```

可以看到：

```
lichee/dsp$ grep -r cmd_my_dsp_asr ./out/ --include=*.bin
Binary file ./out/r128s3/evb1/r128s2_dsp0_evb1.bin matches
Binary file ./out/r128s3/evb1/r128s2_dsp0_evb1_raw.bin matches
Binary file ./out/r128s3/evb1/r128s2_dsp0_evb1_xcc.bin matches
```

烧录固件即可在串口终端输入：

```
rpccli dsp my_dsp_asr
```

后期可以添加开机自启：

```diff
diff --git a/arch/sun20iw2/init-sun20iw2.c b/arch/sun20iw2/init-sun20iw2.c
index cfb2d45d..9b5c2a5d 100644
--- a/arch/sun20iw2/init-sun20iw2.c
+++ b/arch/sun20iw2/init-sun20iw2.c
@@ -160,5 +160,10 @@ void app_init(void)
        rpdata_ctrl_init();
 #endif
 
+#ifdef CONFIG_COMPONENTS_MY_DSP_ASR
+       int cmd_my_dsp_asr(int argc, char *argv[]);
+       cmd_my_dsp_asr(0, NULL);
+#endif
+
 }
```

