[![npm version](https://badge.fury.io/js/@lesjoursfr%2Fcolorpicker.svg)](https://badge.fury.io/js/@lesjoursfr%2Fcolorpicker)
[![QC Checks](https://github.com/lesjoursfr/colorpicker/actions/workflows/quality-control.yml/badge.svg)](https://github.com/lesjoursfr/colorpicker/actions/workflows/quality-control.yml)

# @lesjoursfr/colorpicker

Modular color picker

## Requirements

To work this library needs :

- [@popperjs/core](https://www.npmjs.com/package/@popperjs/core) **2.x**

## How to use

```javascript
import { Colorpicker } from "@lesjoursfr/colorpicker";

/* Initialize the Colorpicker */
new Colorpicker(document.querySelector("#colorpicker"), {
	color: "#C83E2C",
	useAlpha: true,
});
```

## License

The MIT License (MIT).
Please see the [License File](https://github.com/lesjoursfr/colorpicker/blob/master/license) for more information.

## Credits

_Based on Javi Aguilar's color picker (2021)._
