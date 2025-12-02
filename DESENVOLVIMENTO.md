# Documentação do Desenvolvimento

## 1. Verificação inicial do bug

A aplicação foi executada para reproduzir o bug descrito na tarefa.
O problema relatado ocorria ao combinar filtros e trocar de página.

## 2. Limitação do mock

O mock original era pequeno e não permitia testar corretamente o comportamento ao mudar de página após aplicar filtros.

## 3. Expansão do mock

O mock foi ampliado para conter dados suficientes para paginação real.
Após esse ajuste, verificou-se que o filtro continuava funcionando sem inconsistências.

## 4. Implementação do sistema de afinidade

Foi desenvolvido um mecanismo de pontuação para classificar os planos de acordo com as preferências do usuário.
O score final varia de 0 a 100.

### 4.1. Peso do preço

Se o plano tem preço menor ou igual ao máximo desejado, adicionam-se 20 pontos.

### 4.2. Peso da franquia/banda

Se o plano possui franquia maior ou igual à desejada, adicionam-se 10 pontos.

## 5. Arredondamento

Ao final do cálculo, o score é arredondado para duas casas decimais.

## 6. Paginação

Após calcular e ordenar os scores, os planos são paginados conforme os parâmetros de page e pageSize.

## 7. Testes e ajustes

Testes unitários foram escritos cobrindo:

- combinações de filtros
- ordenação por afinidade
- pontuação em múltiplos cenários
- paginação
- casos extremos (preços e franquias muito altos)

Com base nesses testes, o código foi ajustado.
Inicialmente o score era proporcional, mas optou-se por remover o dinamismo e usar pesos fixos (20 ou 0; 10 ou 0) para simplificar e deixar o comportamento mais previsível.

## 8. Refatoração da função handleThing

A versão original continha três loops na mesma função.
Como a tarefa pedia responsabilidades bem definidas, a lógica foi dividida em três funções separadas, mantendo clareza e organização sem alterar o comportamento.

## 9. Implementação no frontend

Foi criado um layout simples onde o usuário pode escolher:

- busca exata
- busca baseada em afinidade

A interface exibe os planos ordenados conforme o score calculado.
