[![npm version](https://badge.fury.io/js/@lesjoursfr%2Fcolorpicker.svg)](https://badge.fury.io/js/@lesjoursfr%2Fcolorpicker)
[![QC Checks](https://github.com/lesjoursfr/colorpicker/actions/workflows/quality-control.yml/badge.svg)](https://github.com/lesjoursfr/colorpicker/actions/workflows/quality-control.yml)

# @lesjoursfr/colorpicker

Modular color picker

## Requirements

To work this library needs :

-   [@popperjs/core](https://www.npmjs.com/package/@popperjs/core) **2.x**

## How to use

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link href="dist/css/colorpicker.css" rel="stylesheet" />
	</head>
	<body>
		<div id="demo">
			<h1>Colorpicker Demo</h1>
			<input type="text" value="rgb(255, 128, 0)" />
		</div>
		<script src="dist/js/colorpicker.js"></script>
		<script>
			colorpicker(window.querySelector("#demo"), {
				inline: true,
				container: "#demo",
			});
		</script>
	</body>
</html>
```

## License

The MIT License (MIT).
Please see the [License File](https://github.com/lesjoursfr/colorpicker/blob/master/license) for more information.

## Credits

_Based on Javi Aguilar's color picker (2021)._
