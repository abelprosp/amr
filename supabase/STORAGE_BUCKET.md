# Bucket de Storage para uploads de treinamento

Para o upload de **documentos** e **fotos** funcionar, crie o bucket no Supabase:

1. Abra o **Dashboard** do projeto: [supabase.com/dashboard](https://supabase.com/dashboard)
2. No menu lateral, vá em **Storage**
3. Clique em **New bucket**
4. **Name:** `trainings`
5. Marque **Public bucket** (para as URLs dos arquivos funcionarem sem assinatura)
6. Clique em **Create bucket**

Opcional: em **Policies** do bucket, você pode restringir quem pode fazer upload (por padrão o upload é feito pela API com service_role).
