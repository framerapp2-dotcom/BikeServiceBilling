-- Shop does not have a GST number.
ALTER TABLE shops DROP COLUMN IF EXISTS gst_number;
ALTER TABLE shops DROP COLUMN IF EXISTS show_gst;
