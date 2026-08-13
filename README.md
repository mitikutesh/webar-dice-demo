# WebAR Dice Demo

A tiny QR-launched WebAR dice game. No app installation is required.

## Run

Open the deployed HTTPS URL on a compatible mobile browser and scan the QR code. WebXR immersive AR requires HTTPS (localhost is also suitable for development). Chrome on supported Android devices is the simplest target.

## Game flow

1. Scan QR code.
2. Tap **Start AR**.
3. Move the camera until a surface reticle appears.
4. Tap the surface to place the die.
5. Tap **Roll Dice**.

A **3D preview** is included for devices without WebXR AR support.

## GitHub Pages

Enable Pages in repository Settings → Pages and select **Deploy from a branch**, branch `main`, folder `/ (root)`. The game is static and needs no server.

## QR code

The page generates a QR code for its own current URL. For printed marketing material, generate a permanent QR code pointing at your final Pages/custom-domain URL.

## Notes

The AR implementation uses WebXR hit testing and Three.js from a CDN. Browser/device support varies; AR availability should be checked on the target phones before a public event.
