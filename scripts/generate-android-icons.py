from pathlib import Path

from PIL import Image


PROJECT_ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("/home/ubuntu/webdev-static-assets/cgpa-calculator-android/gradebook-logo_37220e98.png")
RESOURCES = PROJECT_ROOT / "android" / "app" / "src" / "main" / "res"
ICON_SOURCE = Path("/home/ubuntu/webdev-static-assets/cgpa-calculator-android/android-launcher-icon.png")
BACKGROUND = (6, 19, 31, 255)

LEGACY_SIZES = {"mipmap-mdpi": 48, "mipmap-hdpi": 72, "mipmap-xhdpi": 96, "mipmap-xxhdpi": 144, "mipmap-xxxhdpi": 192}
FOREGROUND_SIZES = {"mipmap-mdpi": 108, "mipmap-hdpi": 162, "mipmap-xhdpi": 216, "mipmap-xxhdpi": 324, "mipmap-xxxhdpi": 432}


def remove_magenta_background(image: Image.Image) -> Image.Image:
    rgba = image.convert("RGBA")
    pixels = []
    for red, green, blue, alpha in rgba.getdata():
        is_magenta_backdrop = red > 165 and blue > 110 and green < 125 and red > green * 1.45 and blue > green * 1.25
        pixels.append((red, green, blue, 0 if is_magenta_backdrop else alpha))
    rgba.putdata(pixels)
    return rgba


def fit_mark(mark: Image.Image, canvas_size: int, fill_ratio: float) -> Image.Image:
    canvas = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    target = int(canvas_size * fill_ratio)
    scale = min(target / mark.width, target / mark.height)
    resized = mark.resize((round(mark.width * scale), round(mark.height * scale)), Image.Resampling.LANCZOS)
    position = ((canvas_size - resized.width) // 2, (canvas_size - resized.height) // 2)
    canvas.alpha_composite(resized, position)
    return canvas


def make_legacy_icon(mark: Image.Image, size: int) -> Image.Image:
    icon = Image.new("RGBA", (size, size), BACKGROUND)
    icon.alpha_composite(fit_mark(mark, size, 0.78))
    return icon.convert("RGB")


source_image = remove_magenta_background(Image.open(SOURCE))
bounding_box = source_image.getbbox()
if bounding_box is None:
    raise RuntimeError("The launcher icon source did not contain a usable foreground mark.")

brand_mark = source_image.crop(bounding_box)
ICON_SOURCE.parent.mkdir(parents=True, exist_ok=True)
make_legacy_icon(brand_mark, 1024).save(ICON_SOURCE, format="PNG", optimize=True)

for resource_folder, size in LEGACY_SIZES.items():
    destination = RESOURCES / resource_folder
    destination.mkdir(parents=True, exist_ok=True)
    icon = make_legacy_icon(brand_mark, size)
    icon.save(destination / "ic_launcher.png", format="PNG", optimize=True)
    icon.save(destination / "ic_launcher_round.png", format="PNG", optimize=True)

for resource_folder, size in FOREGROUND_SIZES.items():
    destination = RESOURCES / resource_folder
    foreground = fit_mark(brand_mark, size, 0.60)
    foreground.save(destination / "ic_launcher_foreground.png", format="PNG", optimize=True)
