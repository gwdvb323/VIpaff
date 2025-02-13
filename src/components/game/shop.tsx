import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGameState } from "@/lib/game-state";
import { useToast } from "@/hooks/use-toast";

const SHOP_ITEMS = {
  disposables: {
    name: "Одноразки",
    categories: [
      {
        name: "HQD",
        items: [
          { id: "hqd_cuvie", name: "HQD Cuvie", price: 100, description: "Компактная одноразка" },
          { id: "hqd_cuvie_plus", name: "HQD Cuvie Plus", price: 150, description: "Увеличенный объем" }
        ]
      },
      {
        name: "ELF BAR",
        items: [
          { id: "elf_bar_600", name: "ELF BAR 600", price: 120, description: "Классическая модель" },
          { id: "elf_bar_1500", name: "ELF BAR 1500", price: 200, description: "Увеличенная емкость" }
        ]
      }
    ]
  },
  liquids: {
    name: "Жидкость",
    categories: [
      {
        name: "Солевой никотин",
        items: [
          { id: "salt_25", name: "Salt 25мг", price: 80, description: "Крепкая солевая жидкость" },
          { id: "salt_20", name: "Salt 20мг", price: 70, description: "Средняя крепость" }
        ]
      },
      {
        name: "Обычный никотин",
        items: [
          { id: "classic_6", name: "Classic 6мг", price: 50, description: "Легкая крепость" },
          { id: "classic_12", name: "Classic 12мг", price: 60, description: "Средняя крепость" }
        ]
      }
    ]
  },
  accessories: {
    name: "Аксессуары",
    categories: [
      {
        name: "Картриджи",
        items: [
          { id: "cart_standard", name: "Стандартный картридж", price: 30, description: "Универсальный картридж" },
          { id: "cart_mesh", name: "Mesh картридж", price: 40, description: "Улучшенный вкус" }
        ]
      },
      {
        name: "Испарители",
        items: [
          { id: "coil_regular", name: "Обычный испаритель", price: 20, description: "Базовая модель" },
          { id: "coil_mesh", name: "Mesh испаритель", price: 25, description: "Улучшенная модель" }
        ]
      }
    ]
  }
};

export default function Shop() {
  const { player, buyItem } = useGameState();
  const { toast } = useToast();

  if (!player) return null;

  const handleBuyItem = (item: { id: string; price: number }) => {
    if (player.coins < item.price) {
      toast({
        title: "Недостаточно монет!",
        description: `Нужно еще ${item.price - player.coins} VIcoins`,
        variant: "destructive"
      });
      return;
    }
    buyItem(item.id);
    toast({
      title: "Покупка успешна!",
      description: `Вы приобрели ${item.name}`,
    });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Магазин</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="disposables" className="w-full">
              <TabsList className="w-full">
                {Object.entries(SHOP_ITEMS).map(([key, section]) => (
                  <TabsTrigger key={key} value={key} className="flex-1">
                    {section.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(SHOP_ITEMS).map(([key, section]) => (
                <TabsContent key={key} value={key}>
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-6">
                      {section.categories.map((category) => (
                        <div key={category.name} className="space-y-4">
                          <h3 className="font-semibold text-lg">{category.name}</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {category.items.map((item) => (
                              <Card key={item.id}>
                                <CardHeader>
                                  <CardTitle className="text-lg">{item.name}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
                                  <div className="flex justify-between items-center">
                                    <span className="font-medium">{item.price} VIcoins</span>
                                    <button
                                      onClick={() => handleBuyItem(item)}
                                      className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 disabled:opacity-50"
                                      disabled={player.coins < item.price}
                                    >
                                      Купить
                                    </button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}