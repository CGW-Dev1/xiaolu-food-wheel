package com.xiaolu.foodwheel;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;

import androidx.activity.result.ActivityResult;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "DataExport")
public class DataExportPlugin extends Plugin {
    @PluginMethod
    public void saveJson(PluginCall call) {
        String fileName = call.getString("fileName", "xiaolu-backup.json");
        String content = call.getString("content");

        if (content == null) {
            call.reject("Missing export content");
            return;
        }

        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("application/json");
        intent.putExtra(Intent.EXTRA_TITLE, fileName);

        try {
            startActivityForResult(call, intent, "saveJsonResult");
        } catch (ActivityNotFoundException exception) {
            call.reject("No file picker available", exception);
        }
    }

    @ActivityCallback
    private void saveJsonResult(PluginCall call, ActivityResult result) {
        if (call == null) {
            return;
        }

        Intent data = result.getData();
        Uri uri = data != null ? data.getData() : null;
        if (result.getResultCode() != Activity.RESULT_OK || uri == null) {
            call.reject("Export cancelled");
            return;
        }

        String content = call.getString("content", "");

        try (OutputStream outputStream = getContext().getContentResolver().openOutputStream(uri)) {
            if (outputStream == null) {
                call.reject("Cannot open selected file");
                return;
            }

            outputStream.write(content.getBytes(StandardCharsets.UTF_8));
            outputStream.flush();

            JSObject response = new JSObject();
            response.put("uri", uri.toString());
            call.resolve(response);
        } catch (Exception exception) {
            call.reject("Failed to write export file", exception);
        }
    }
}
