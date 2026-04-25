"""Utility script to prepare the dataset splits and train a YOLOv8 model."""

from __future__ import annotations

import argparse
import random
import shutil
from pathlib import Path
from typing import List, Tuple

from ultralytics import YOLO

PROJECT_DIR = Path(__file__).resolve().parent
DEFAULT_DATASET_DIR = PROJECT_DIR / "final_dataset"
DEFAULT_WEIGHTS = PROJECT_DIR / "yolov8s.pt"
IMAGE_EXTENSIONS = {".bmp", ".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp"}


def compute_split_counts(total: int, train_ratio: float, val_ratio: float) -> Tuple[int, int, int]:
    if total < 3:
        raise ValueError("At least 3 samples are required to create train/val/test splits.")

    train_count = max(1, round(total * train_ratio))
    val_count = max(1, round(total * val_ratio))
    test_count = max(1, total - train_count - val_count)

    while train_count + val_count + test_count > total:
        if train_count >= val_count and train_count >= test_count and train_count > 1:
            train_count -= 1
        elif val_count >= test_count and val_count > 1:
            val_count -= 1
        elif test_count > 1:
            test_count -= 1
        else:
            break

    while train_count + val_count + test_count < total:
        train_count += 1

    test_count = total - train_count - val_count
    if test_count <= 0:
        test_count = 1
        if train_count > val_count and train_count > 1:
            train_count -= 1
        elif val_count > 1:
            val_count -= 1
        else:
            raise ValueError("Unable to compute non-zero split sizes.")

    return train_count, val_count, test_count


def ensure_dataset_splits(data_dir: Path, train_ratio: float, val_ratio: float, seed: int) -> None:
    valid_images = data_dir / "valid" / "images"
    valid_labels = data_dir / "valid" / "labels"
    test_images = data_dir / "test" / "images"
    test_labels = data_dir / "test" / "labels"

    if (
        valid_images.exists()
        and any(valid_images.iterdir())
        and valid_labels.exists()
        and any(valid_labels.iterdir())
        and test_images.exists()
        and any(test_images.iterdir())
        and test_labels.exists()
        and any(test_labels.iterdir())
    ):
        print("✅ Dataset splits already present. Skipping preparation.")
        return

    source_images = data_dir / "train" / "images"
    source_labels = data_dir / "train" / "labels"

    if not source_images.exists():
        raise FileNotFoundError(f"Expected source images directory at {source_images}")
    if not source_labels.exists():
        raise FileNotFoundError(f"Expected source labels directory at {source_labels}")

    pairs: List[Tuple[Path, Path]] = []
    for image_path in sorted(source_images.iterdir()):
        if image_path.suffix.lower() not in IMAGE_EXTENSIONS:
            continue
        label_path = source_labels / f"{image_path.stem}.txt"
        if not label_path.exists():
            raise FileNotFoundError(f"Missing label file for {image_path.name}")
        pairs.append((image_path, label_path))

    if len(pairs) < 3:
        raise ValueError(
            f"Need at least 3 labeled images to create train/val/test splits (found {len(pairs)})."
        )

    if train_ratio + val_ratio >= 1:
        raise ValueError("train_ratio + val_ratio must be < 1 to allocate samples to the test split.")

    rng = random.Random(seed)
    rng.shuffle(pairs)

    train_count, val_count, test_count = compute_split_counts(len(pairs), train_ratio, val_ratio)

    splits = {
        "train": pairs[:train_count],
        "valid": pairs[train_count : train_count + val_count],
        "test": pairs[train_count + val_count :],
    }

    split_root = data_dir / "_split_tmp"
    if split_root.exists():
        shutil.rmtree(split_root)

    for split_name in ("train", "valid", "test"):
        (split_root / split_name / "images").mkdir(parents=True, exist_ok=True)
        (split_root / split_name / "labels").mkdir(parents=True, exist_ok=True)

    for split_name, split_pairs in splits.items():
        dest_images = split_root / split_name / "images"
        dest_labels = split_root / split_name / "labels"
        for image_path, label_path in split_pairs:
            shutil.copy2(image_path, dest_images / image_path.name)
            shutil.copy2(label_path, dest_labels / label_path.name)

    for split_name in ("train", "valid", "test"):
        target_dir = data_dir / split_name
        if target_dir.exists():
            shutil.rmtree(target_dir)
        (split_root / split_name).rename(target_dir)

    if split_root.exists():
        shutil.rmtree(split_root)

    print(
        "✅ Dataset prepared: "
        f"{train_count} train / {val_count} val / {test_count} test samples."
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Train YOLOv8 on a custom dataset.")
    parser.add_argument(
        "--weights",
        default=str(DEFAULT_WEIGHTS),
        help="Path to the starting weights file (default: yolov8s.pt).",
    )
    parser.add_argument(
        "--data-dir",
        default=str(DEFAULT_DATASET_DIR),
        help="Directory containing the dataset and data.yaml (default: ./dataset).",
    )
    parser.add_argument(
        "--data-config",
        default=None,
        help="Optional explicit path to the data.yaml file (overrides --data-dir).",
    )
    parser.add_argument("--epochs", type=int, default=100, help="Number of training epochs.")
    parser.add_argument("--imgsz", type=int, default=640, help="Image size for training.")
    parser.add_argument("--batch", type=int, default=8, help="Batch size for training.")
    parser.add_argument(
        "--device",
        default=None,
        help="Torch device identifier (e.g. '0' for GPU 0 or 'cpu').",
    )
    parser.add_argument(
        "--train-ratio",
        type=float,
        default=0.8,
        help="Fraction of samples allocated to the training split (default: 0.8).",
    )
    parser.add_argument(
        "--val-ratio",
        type=float,
        default=0.1,
        help="Fraction of samples allocated to the validation split (default: 0.1).",
    )
    parser.add_argument(
        "--seed",
        type=int,
        default=42,
        help="Random seed used for shuffling during dataset preparation.",
    )
    parser.add_argument(
        "--run-name",
        default="bookshelf-yolov8",
        help="Name of the training run inside the runs/ directory.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    dataset_dir = Path(args.data_dir).expanduser().resolve()
    if not dataset_dir.exists():
        raise FileNotFoundError(f"Dataset directory not found at {dataset_dir}")

    if args.data_config:
        data_config_path = Path(args.data_config).expanduser().resolve()
    else:
        data_config_path = dataset_dir / "data.yaml"

    if not data_config_path.exists():
        raise FileNotFoundError(f"Dataset config file not found at {data_config_path}")

    ensure_dataset_splits(dataset_dir, args.train_ratio, args.val_ratio, args.seed)

    model = YOLO(args.weights)

    train_kwargs = {
        "data": str(data_config_path),
        "epochs": args.epochs,
        "imgsz": args.imgsz,
        "batch": args.batch,
        "project": str(PROJECT_DIR / "runs"),
        "name": args.run_name,
        "exist_ok": True,
    }

    if args.device:
        train_kwargs["device"] = args.device

    print("🚀 Starting YOLOv8 training...")
    model.train(**train_kwargs)


if __name__ == "__main__":
    main()
