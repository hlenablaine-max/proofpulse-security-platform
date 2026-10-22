# Worker Strix

Executa pentests reais com o [Strix](https://github.com/usestrix/strix) (Apache-2.0) em um servidor com Docker e envia os achados para o app.

## Requisitos
- Servidor Linux com Docker em execução
- Python 3.9+
- Strix instalado: `curl -sSL https://strix.ai/install | bash`
- Chave de um provedor de LLM compatível com o Strix

## Executar
```bash
export APP_URL="https://SEU-APP.lovable.app"
export WORKER_API_KEY="a mesma chave cadastrada no app"
export STRIX_LLM="openrouter/z-ai/glm-5.3"
export LLM_API_KEY="sua-chave-llm"
python3 strix_worker.py
```

O worker consulta `/api/public/worker/claim` a cada 15 s, roda `strix -n -t <alvo>` e envia o resultado para `/api/public/worker/result`.

## Uso responsável
Só execute contra alvos que o cliente declarou possuir ou ter autorização para testar. O Strix executa exploração real.

Strix © usestrix, licença Apache-2.0.
