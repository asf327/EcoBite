function classifyRetailMeal(itemName = "", description = "") {
  const text = `${itemName} ${description}`.toLowerCase();

  if (text.includes("smoothie")) {
    return {
      type: "smoothie",
      components: [
        { category: "Other Fruit", weightFraction: 0.6 },
        { category: "Milk", weightFraction: 0.25 },
        { category: "Cane Sugar", weightFraction: 0.15 }
      ]
    };
  }

  if (text.includes("acai") || text.includes("açaí")) {
    return {
      type: "smoothie_bowl",
      components: [
        { category: "Other Fruit", weightFraction: 0.55 },
        { category: "Oatmeal", weightFraction: 0.2 },
        { category: "Nuts", weightFraction: 0.1 },
        { category: "Cane Sugar", weightFraction: 0.15 }
      ]
    };
  }

  if (
    text.includes("coffee") ||
    text.includes("latte") ||
    text.includes("mocha") ||
    text.includes("macchiato") ||
    text.includes("americano") ||
    text.includes("cappuccino") ||
    text.includes("cold brew") ||
    text.includes("tea") ||
    text.includes("hot chocolate")
  ) {
    if (
      text.includes("latte") ||
      text.includes("mocha") ||
      text.includes("cappuccino") ||
      text.includes("macchiato") ||
      text.includes("hot chocolate")
    ) {
      return {
        type: "beverage",
        components: [
          { category: "Milk", weightFraction: 0.7 },
          { category: "Cane Sugar", weightFraction: text.includes("mocha") || text.includes("caramel") || text.includes("white chocolate") ? 0.2 : 0.05 },
          { category: "Other Fruit", weightFraction: 0.1 }
        ]
      };
    }

    return {
      type: "beverage",
      components: [
        { category: "Other Fruit", weightFraction: 0.95 },
        { category: "Cane Sugar", weightFraction: 0.05 }
      ]
    };
  }

  if (text.includes("breakfast sandwich")) {
    if (text.includes("plant based") || text.includes("plant-based")) {
      return {
        type: "breakfast_sandwich",
        components: [
          { category: "Wheat & Rye", weightFraction: 0.35 },
          { category: "Other Pulses", weightFraction: 0.25 },
          { category: "Cheese", weightFraction: 0.2 },
          { category: "Other Vegetables", weightFraction: 0.2 }
        ]
      };
    }

    let proteinCategory = "Eggs";

    if (text.includes("bacon") || text.includes("ham") || text.includes("sausage")) {
      proteinCategory = text.includes("turkey") ? "Poultry Meat" : "Pig Meat";
    }

    return {
      type: "breakfast_sandwich",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: "Eggs", weightFraction: 0.2 },
        { category: "Cheese", weightFraction: 0.2 },
        { category: proteinCategory, weightFraction: 0.25 }
      ]
    };
  }

  if (text.includes("toast")) {
    return {
        type: "toast",
        components: [
        { category: "Wheat & Rye", weightFraction: 0.45 },
        { category: text.includes("avocado") ? "Other Fruit" : "Other Vegetables", weightFraction: 0.30 },
        { category: text.includes("parmesan") || text.includes("caprese") ? "Cheese" : "Other Vegetables", weightFraction: 0.20 },
        { category: "Cane Sugar", weightFraction: 0.05 }
        ]
    };
  }

  if (
    text.includes("beef patty") ||
    text.includes("grilled chicken") ||
    text.includes("crispy chicken") ||
    text.includes("pulled pork") ||
    text.includes("mac & cheese") ||
    text.includes("mozzarella sticks")
  ) {
    let proteinCategory = "Other Pulses";
    let secondaryCategory = "Other Vegetables";

    if (text.includes("beef patty")) {
      proteinCategory = "Beef (beef herd)";
      secondaryCategory = "Wheat & Rye";
    } else if (
      text.includes("grilled chicken") ||
      text.includes("crispy chicken")
    ) {
      proteinCategory = "Poultry Meat";
      secondaryCategory = "Other Vegetables";
    } else if (text.includes("pulled pork")) {
      proteinCategory = "Pig Meat";
      secondaryCategory = "Other Vegetables";
    } else if (
      text.includes("mac & cheese") ||
      text.includes("mozzarella sticks")
    ) {
      proteinCategory = "Cheese";
      secondaryCategory = "Wheat & Rye";
    }

    return {
      type: "single_item",
      components: [
        { category: proteinCategory, weightFraction: 0.7 },
        { category: secondaryCategory, weightFraction: 0.3 }
      ]
    };
  }

  if (
    text.includes("bagel") ||
    text.includes("croissant") ||
    text.includes("muffin") ||
    text.includes("donut") ||
    text.includes("cookie") ||
    text.includes("danish") ||
    text.includes("brownie")
  ) {
    const hasCreamCheese = text.includes("cream cheese");

    return {
      type: "bakery",
      components: hasCreamCheese
        ? [
            { category: "Wheat & Rye", weightFraction: 0.65 },
            { category: "Cheese", weightFraction: 0.2 },
            { category: "Cane Sugar", weightFraction: 0.15 }
          ]
        : [
            { category: "Wheat & Rye", weightFraction: 0.65 },
            { category: "Cane Sugar", weightFraction: 0.25 },
            { category: "Milk", weightFraction: 0.1 }
          ]
    };
  }

  if (
    text.includes("sandwich") ||
    text.includes("club") ||
    text.includes("ciabatta") ||
    text.includes("focaccia") ||
    text.includes("panini") ||
    text.includes("baguette") ||
    text.includes("sub") ||
    text.includes("wrap") ||
    text.includes('6"') ||
    text.includes('12"') ||
    text.includes("chicken salad") ||
    text.includes("turkey provolone") ||
    text.includes("buff chix") ||
    text.includes("italian") ||
    text.includes("meatball") ||
    text.includes("tuna") ||
    text.includes("french dip") 
  ) {
    let proteinCategory = "Other Pulses";

    if (text.includes("beef") || text.includes("meatball") || text.includes("corned beef") || text.includes("pastrami")) {
      proteinCategory = "Beef (beef herd)";
    } else if (text.includes("ham") || text.includes("salami") || text.includes("capicola") || text.includes("bacon")) {
      proteinCategory = "Pig Meat";
    } else if (text.includes("chicken") || text.includes("turkey")) {
      proteinCategory = "Poultry Meat";
    } else if (text.includes("tuna")) {
      proteinCategory = "Fish (farmed)";
    } else if (text.includes("portabello") || text.includes("portobello") || text.includes("veggie")) {
      proteinCategory = "Other Vegetables";
    }

    return {
      type: "sandwich",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: proteinCategory, weightFraction: 0.3 },
        {
          category: "Cheese",
          weightFraction: /mozzarella|provolone|swiss|american|parmesan|cheese|gouda/i.test(text) ? 0.15 : 0.05
        },
        { category: "Other Vegetables", weightFraction: 0.15 },
        { category: "Cane Sugar", weightFraction: 0.05 }
      ]
    };
  }

  if (text.includes("soup")) {
    let proteinCategory = "Other Vegetables";

    if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    if (text.includes("clam")) proteinCategory = "Fish (farmed)";
    if (text.includes("cheddar") || text.includes("gouda")) proteinCategory = "Cheese";

    return {
      type: "soup",
      components: [
        { category: "Other Vegetables", weightFraction: 0.45 },
        { category: proteinCategory, weightFraction: 0.25 },
        { category: "Wheat & Rye", weightFraction: 0.1 },
        { category: "Milk", weightFraction: 0.2 }
      ]
    };
  }

  if (text.includes("quesadilla")) {
    let proteinCategory = "Other Pulses";

    if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    if (text.includes("mushroom")) proteinCategory = "Other Vegetables";
    if (text.includes("impossible")) proteinCategory = "Other Pulses";

    return {
      type: "quesadilla",
      components: [
        { category: "Wheat & Rye", weightFraction: 0.35 },
        { category: proteinCategory, weightFraction: 0.25 },
        { category: "Cheese", weightFraction: 0.3 },
        { category: "Other Vegetables", weightFraction: 0.1 }
      ]
    };
  }

  if (text.includes("bowl")) {
    let proteinCategory = "Other Pulses";

    if (text.includes("beef")) proteinCategory = "Beef (beef herd)";
    else if (text.includes("chicken")) proteinCategory = "Poultry Meat";
    else if (text.includes("shrimp")) proteinCategory = "Prawns (farmed)";
    else if (text.includes("tofu")) proteinCategory = "Tofu";
    else if (text.includes("salmon") || text.includes("tuna")) proteinCategory = "Fish (farmed)";

    let baseCategory = "Rice";
    if (text.includes("lo mein")) baseCategory = "Wheat & Rye";
    if (text.includes("veggies only")) baseCategory = "Other Vegetables";

    return {
      type: "bowl",
      components: [
        { category: proteinCategory, weightFraction: 0.35 },
        { category: baseCategory, weightFraction: 0.35 },
        { category: "Other Vegetables", weightFraction: 0.2 },
        { category: "Cane Sugar", weightFraction: 0.1 }
      ]
    };
  }

  if (
    text.includes("poke") ||
    text.includes("sushi") ||
    text.includes("nigiri") ||
    text.includes("roll") ||
    text.includes("salmon") ||
    text.includes("tuna")
  ) {
    let proteinCategory = "Fish (farmed)";

    if (text.includes("shrimp")) proteinCategory = "Prawns (farmed)";
    if (text.includes("tofu")) proteinCategory = "Tofu";

    return {
      type: "sushi_poke",
      components: [
        { category: proteinCategory, weightFraction: 0.3 },
        { category: "Rice", weightFraction: 0.35 },
        { category: "Other Vegetables", weightFraction: 0.2 },
        { category: "Cane Sugar", weightFraction: 0.05 },
        { category: "Nuts", weightFraction: 0.1 }
      ]
    };
  }

  if (
    text.includes("burger") ||
    text.includes("chicken tenders") ||
    text.includes("popcorn chicken") ||
    text.includes("wings")
  ) {
    let proteinCategory = "Beef (beef herd)";

    if (text.includes("chicken") || text.includes("wings")) {
      proteinCategory = "Poultry Meat";
    }

    if (text.includes("veggie") || text.includes("plant-based") || text.includes("plant based")) {
      proteinCategory = "Other Pulses";
    }

    return {
      type: "handheld_or_fried",
      components: [
        { category: proteinCategory, weightFraction: 0.45 },
        { category: "Wheat & Rye", weightFraction: 0.25 },
        { category: "Other Vegetables", weightFraction: 0.15 },
        { category: "Cane Sugar", weightFraction: 0.15 }
      ]
    };
  }

  return {
    type: "unknown",
    components: [
      { category: "Other Vegetables", weightFraction: 0.4 },
      { category: "Wheat & Rye", weightFraction: 0.3 },
      { category: "Other Pulses", weightFraction: 0.3 }
    ]
  };
}

module.exports = {
  classifyRetailMeal
};
