import pandas as pd
import sys

try:
    df = pd.read_excel('KODE-WILAYAH-KEPMENDAGRI-2025.xlsx', nrows=5)
    print(df.columns)
    print(df.head())
except Exception as e:
    print(e)
