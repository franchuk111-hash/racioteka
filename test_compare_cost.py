import unittest
from decimal import Decimal
from compare_cost import calculate


class CostTests(unittest.TestCase):
    def test_complete_quote(self):
        self.assertEqual(calculate("500", 5, "80", 3, "100", "50"), (Decimal("2790"), Decimal("558")))

    def test_fractional_money(self):
        self.assertEqual(calculate("100.10", 3, "0", 0, "0.03", "0"), (Decimal("300.33"), Decimal("100.11")))

    def test_invalid_quotes(self):
        for patch in ({"daily": "NaN"}, {"daily": "Infinity"}, {"daily": "-1"}, {"daily": "unknown"}, {"days": 0}, {"days": 1.5}, {"days": True}, {"deliveries": -1}, {"discount": "10000"}):
            quote = dict(daily="500", days=5, delivery_fee="80", deliveries=3, extras="0", discount="0")
            quote.update(patch)
            with self.subTest(patch=patch), self.assertRaises(ValueError):
                calculate(**quote)

    def test_zero_total_allowed(self):
        self.assertEqual(calculate("100", 1, "0", 0, "0", "100"), (Decimal("0"), Decimal("0")))


if __name__ == "__main__":
    unittest.main()
