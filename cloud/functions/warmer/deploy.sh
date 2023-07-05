gcloud functions deploy warmer \
--region=us-central1 \
--runtime=nodejs16 \
--source=. \
--entry-point=warmer \
--timeout 240 \
--trigger-http \
--allow-unauthenticated