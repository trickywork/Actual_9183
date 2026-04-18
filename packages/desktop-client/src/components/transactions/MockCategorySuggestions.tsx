import { Button } from '@actual-app/components/button';
import { Text } from '@actual-app/components/text';
import { theme } from '@actual-app/components/theme';
import { View } from '@actual-app/components/view';

export function MockCategorySuggestions({
  transaction,
  categoryGroups,
  onApplyCategory,
  onInfo,
  onError,
}: any) {
  const flatCategories: Array<{ id: string; name: string }> = [];

  for (const group of categoryGroups || []) {
    if (Array.isArray(group?.categories)) {
      for (const category of group.categories) {
        if (category?.id && category?.name) {
          flatCategories.push({ 
            id: String(category.id),
            name: String(category.name),
          });
        }
      }
    }
  }

  const deduped: Array<{ id: string; name: string }> = [];
  const seen = new Set<string>();
  for (const item of flatCategories) {
    if (!seen.has(item.id)) {
      seen.add(item.id);
      deduped.push(item);
    }
  }

  const top3 = deduped.slice(0, 3);

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
          color: 'red',
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
       MOCK PANEL LOADED
      </Text>

      <Text
        style={{
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 6,
        }}
      >
        SmartCat mock · Top-3 suggestions
      </Text>

      <Text style={{ color: theme.pageTextSubdued, marginBottom: 8 }}>
        {transaction?.imported_payee ||
          transaction?.notes ||
          `tx ${transaction?.id}`}
      </Text>

      <Text style={{ color: 'red', marginBottom: 8 }}>
        category count: {deduped.length}
      </Text>

      {top3.length === 0 ? (
        <Text style={{ color: 'red' }}>NO CATEGORY BUTTONS AVAILABLE</Text>
      ) : (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {top3.map((item, index) => (
            <Button
              key={item.id}
              variant="bare"
              onPress={() => {
                Promise.resolve(onApplyCategory(transaction, item.id))
                  .then(() => {
                    onInfo(
                      `mock applied ${item.name} (${index === 0 ? 82 : index === 1 ? 11 : 7}%)`,
                    );
                  })
                  .catch(() => {
                    onError('mock apply failed');
                  });
              }}
              style={{
                marginRight: 8,
                marginBottom: 8,
                padding: '6px 10px',
                borderWidth: 1,
                borderStyle: 'solid',
                borderColor: '#444',
                borderRadius: 999,
                backgroundColor: '#f5f5f5',
              }}
            >
              <Text>{item.name}</Text>
            </Button>
          ))}
        </View>
      )}
    </View>
  );
}
