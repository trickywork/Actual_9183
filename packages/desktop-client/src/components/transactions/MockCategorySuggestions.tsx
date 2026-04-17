import { useMemo, useState } from 'react';

import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';
import type {
  CategoryGroupEntity,
  TransactionEntity,
} from '@actual-app/core/types/models';

type Props = {
  transaction: TransactionEntity;
  categoryGroups: CategoryGroupEntity[];
  onApplyCategory: (
    transaction: TransactionEntity,
    categoryId: string,
  ) => Promise<void>;
  onInfo: (message: string) => void;
  onError: (message: string) => void;
};

type FlatCategory = {
  id: string;
  name: string;
};

type SuggestedCategory = FlatCategory & {
  score: number;
};

const PREFERRED_NAMES = [
  'Food & Dining',
  'Groceries',
  'Restaurants',
  'Transport',
  'Shopping',
  'Rent',
  'Utilities',
  'Entertainment',
];

function normalizeName(value: string | null | undefined) {
  return String(value || '')
    .trim()
    .toLowerCase();
}

function flattenCategoryGroups(
  categoryGroups: CategoryGroupEntity[],
): FlatCategory[] {
  const rows: FlatCategory[] = [];

  for (const group of categoryGroups || []) {
    for (const category of group?.categories || []) {
      if (!category?.id || !category?.name) {
        continue;
      }

      rows.push({
        id: String(category.id),
        name: String(category.name),
      });
    }
  }

  return rows;
}

function pickMockSuggestions(
  categoryGroups: CategoryGroupEntity[],
): SuggestedCategory[] {
  const flat = flattenCategoryGroups(categoryGroups);
  const picked: SuggestedCategory[] = [];

  for (const preferred of PREFERRED_NAMES) {
    const match = flat.find(
      cat => normalizeName(cat.name) === normalizeName(preferred),
    );

    if (match && !picked.some(item => item.id === match.id)) {
      const score =
        picked.length === 0 ? 0.82 : picked.length === 1 ? 0.11 : 0.07;

      picked.push({
        ...match,
        score,
      });
    }

    if (picked.length === 3) {
      return picked;
    }
  }

  for (const cat of flat) {
    if (!picked.some(item => item.id === cat.id)) {
      const score =
        picked.length === 0 ? 0.82 : picked.length === 1 ? 0.11 : 0.07;

      picked.push({
        ...cat,
        score,
      });
    }

    if (picked.length === 3) {
      break;
    }
  }

  return picked;
}

function getTransactionTitle(transaction: TransactionEntity) {
  return (
    String(transaction.imported_payee || '').trim() ||
    String(transaction.notes || '').trim() ||
    `Uncategorized transaction ${transaction.id}`
  );
}

export function MockCategorySuggestions({
  transaction,
  categoryGroups,
  onApplyCategory,
  onInfo,
  onError,
}: Props) {
  const [applyPending, setApplyPending] = useState(false);

  const suggestions = useMemo(
    () => pickMockSuggestions(categoryGroups),
    [categoryGroups],
  );

  const title = useMemo(() => getTransactionTitle(transaction), [transaction]);

  async function handleApply(categoryId: string) {
    if (applyPending) {
      return;
    }

    try {
      setApplyPending(true);
      await onApplyCategory(transaction, categoryId);

      const picked = suggestions.find(item => item.id === categoryId);
      onInfo(`SmartCat mock applied "${picked?.name || categoryId}"`);
    } catch (err) {
      console.error(err);
      onError('Failed to apply mock category');
    } finally {
      setApplyPending(false);
    }
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <View
      style={{
        padding: 12,
        borderBottomWidth: 1,
        borderColor: theme.tableBorder,
        backgroundColor: theme.tableBackground,
      }}
    >
      <Text
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        SmartCat mock · Top-3 suggestions
      </Text>

      <Text
        style={{
          color: theme.pageTextSubdued,
          marginBottom: 10,
        }}
      >
        {title}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {suggestions.map(item => (
          <Button
            key={item.id}
            variant="bare"
            onPress={() => {
              void handleApply(item.id);
            }}
            style={{
              marginRight: 8,
              marginBottom: 8,
              padding: '6px 10px',
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: theme.buttonNormalBorder,
              borderRadius: 999,
              backgroundColor: theme.pageBackground,
              opacity: applyPending ? 0.6 : 1,
            }}
          >
            <Text>
              {item.name} ({Math.round(item.score * 100)}%)
            </Text>
          </Button>
        ))}
      </View>
    </View>
  );
}