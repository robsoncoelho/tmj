json.cards @cards do |card|
  json.partial! 'cards/card', card: card
end