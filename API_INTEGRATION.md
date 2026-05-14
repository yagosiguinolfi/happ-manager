# Integração com API

Este projeto está integrado com a API `happ-manager-api`. Este documento descreve como usar a integração.

## Configuração

### Variáveis de Ambiente

As variáveis de ambiente são definidas no arquivo `.env` na raiz do projeto. Um arquivo `.env.example` é fornecido como template.

**Arquivo `.env`:**
```env
# API Configuration
VITE_API_URL=http://localhost:3000
```

Para desenvolvimento local, use `http://localhost:3000`. Para produção, altere para o URL da sua API de produção.

> **Nota:** O arquivo `.env` não deve ser commitado no Git (já está no `.gitignore`).

## Usando o Cliente API

### Estrutura de Arquivos

```
src/lib/
├── api-client.ts           # Cliente axios configurado
└── api-services/
    ├── user-service.ts     # Serviço de usuários
    └── [outros serviços]
```

### Exemplo de Uso - Autenticação

No arquivo [src/routes/login.tsx](src/routes/login.tsx), o serviço é usado assim:

```typescript
import { userService } from '../lib/api-services/user-service'

// Fazer login
const response = await userService.login(email, password)
localStorage.setItem('authToken', response.data.token)
```

### Criando Novos Serviços

Para criar um novo serviço de API (exemplo: categorias):

**Arquivo: `src/lib/api-services/category-service.ts`**
```typescript
import apiClient from '../api-client';

export const categoryService = {
  // Get all categories
  getAll: () =>
    apiClient.get('/api/categories'),

  // Get category by id
  getById: (id: string) =>
    apiClient.get(`/api/categories/${id}`),

  // Create category
  create: (data: any) =>
    apiClient.post('/api/categories', data),

  // Update category
  update: (id: string, data: any) =>
    apiClient.put(`/api/categories/${id}`, data),

  // Delete category
  delete: (id: string) =>
    apiClient.delete(`/api/categories/${id}`),
};
```

Depois use em um componente:

```typescript
import { categoryService } from '../lib/api-services/category-service'
import { useEffect, useState } from 'react'

export function CategoriesList() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAll()
        setCategories(response.data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) return <div>Carregando...</div>
  if (error) return <div>Erro: {error}</div>

  return (
    <div>
      {categories.map(category => (
        <div key={category.id}>{category.name}</div>
      ))}
    </div>
  )
}
```

## Interceptadores

O cliente API inclui interceptadores automáticos:

### Request Interceptor
- Adiciona o token de autenticação (`Authorization: Bearer <token>`) automaticamente a todas as requisições
- O token é obtido do `localStorage.authToken`

### Response Interceptor
- Se receber status 401 (Unauthorized), remove o token e redireciona para `/login`
- Propaga outros erros normalmente

## Tratamento de Erros

```typescript
try {
  const response = await userService.login(email, password)
} catch (error) {
  // error.response.status - código HTTP
  // error.response.data - resposta do servidor
  // error.message - mensagem de erro
  console.error(error.response?.data?.message)
}
```

## Iniciar Desenvolvimento

1. **Instale as dependências:**
   ```bash
   npm install
   ```

2. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

3. **A aplicação estará disponível em:** `http://localhost:5173` (porta padrão do Vite)

4. **Certifique-se de que a API está rodando:**
   ```bash
   # Em outro terminal, na pasta happ-manager-api/
   npm run dev
   ```

## CORS

Se estiver recebendo erros de CORS, certifique-se de que a API tem CORS configurado. No arquivo `src/app.js` da API, adicione:

```javascript
import cors from 'cors';

app.use(cors());
```

## Variáveis de Ambiente em Componentes

Para acessar a variável `VITE_API_URL` em qualquer lugar do código:

```typescript
const apiUrl = import.meta.env.VITE_API_URL
console.log(apiUrl) // http://localhost:3000
```

Isso só funciona com variáveis prefixadas com `VITE_` (padrão do Vite).
