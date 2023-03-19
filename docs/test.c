#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

#include <hal_cmd.h>
#include <hal_log.h>

#include "sunxi_hal_cir.h"

static cir_callback_t cir_irq_callback(uint32_t data_type, uint32_t data) {
  printf("reg_val:0x%u\n", data);
  return 0;
}

int cmd_test_cir(int argc, char **argv) {
  cir_port_t port;
  int ret = -1;
  int timeout_sec = 15;
  TickType_t start_ticks, current_ticks;

  printf("Run ir test\n");

  if (argc < 2) {
    hal_log_err("usage: hal_ir channel\n");
    return -1;
  }

  port = strtol(argv[1], NULL, 0);
  ret = sunxi_cir_init(port);
  if (ret) {
    hal_log_err("cir init failed!\n");
    return -1;
  }

  sunxi_cir_callback_register(port, cir_irq_callback);
  start_ticks = xTaskGetTickCount();
  printf("start_ticks: %u\n", start_ticks);

  while (1) {
    current_ticks = xTaskGetTickCount();
    if ((current_ticks - start_ticks) * portTICK_PERIOD_MS >=
        timeout_sec * 1000) {
      printf("current_ticks: %u\n", current_ticks);
      break;
    }
  }
  sunxi_cir_deinit(port);
  return 0;
}