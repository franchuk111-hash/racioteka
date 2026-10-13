"""Compare complete meal-delivery quote costs; no external dependencies."""
import argparse
from decimal import Decimal, InvalidOperation


def amount(value):
    try:
        number = Decimal(str(value))
    except (InvalidOperation, ValueError):
        raise ValueError("Сума має бути числом") from None
    if not number.is_finite() or number < 0:
        raise ValueError("Сума має бути скінченним невід'ємним числом")
    return number


def calculate(daily, days, delivery_fee, deliveries, extras, discount):
    if isinstance(days, bool) or not isinstance(days, int) or days < 1:
        raise ValueError("Кількість днів має бути цілим числом від 1")
    if isinstance(deliveries, bool) or not isinstance(deliveries, int) or deliveries < 0:
        raise ValueError("Кількість доставок має бути цілим невід'ємним числом")
    daily, delivery_fee, extras, discount = map(amount, (daily, delivery_fee, extras, discount))
    total = daily * days + delivery_fee * deliveries + extras - discount
    if total < 0:
        raise ValueError("Знижка перевищує вартість замовлення")
    return total, total / days


def main():
    parser = argparse.ArgumentParser(description="Повна вартість доставки раціону")
    parser.add_argument("--daily", required=True, help="Ціна раціону за день, грн")
    parser.add_argument("--days", required=True, type=int)
    parser.add_argument("--delivery-fee", required=True, help="Вартість однієї доставки, грн; 0 лише якщо безкоштовна")
    parser.add_argument("--deliveries", required=True, type=int)
    parser.add_argument("--extras", default="0", help="Усі доплати за замовлення, грн")
    parser.add_argument("--discount", default="0", help="Знижка на все замовлення, грн")
    args = parser.parse_args()
    try:
        total, daily = calculate(args.daily, args.days, args.delivery_fee, args.deliveries, args.extras, args.discount)
    except ValueError as error:
        parser.error(str(error))
    print(f"За замовлення: {total:.2f} грн\nЗа день: {daily:.2f} грн")


if __name__ == "__main__":
    main()
