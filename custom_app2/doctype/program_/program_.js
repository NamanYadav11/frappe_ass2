frappe.ui.form.on('Program_', {
    refresh: function(frm) {
        frm.add_custom_button(__('Add New Item'), function() {
            let d = new frappe.ui.Dialog({
                title: "Add Items",
                fields: [
                    {
                        label: 'Item Group',
                        fieldname: 'item_group',
                        fieldtype: 'Link',
                        options: 'Item Group',
                        onchange: function() {
                            var itemGroup = d.get_value('item_group');
                            if (itemGroup) {
                                d.set_query('item', function() {
                                    return {
                                        filters: {
                                            'item_group': itemGroup
                                        }
                                    };
                                });
                            }
                        }
                    },
                    {
                        label: 'Item',
                        fieldname: 'item',
                        fieldtype: 'Link',
                        options: 'Item',
                        onchange: function() {
                            var item = d.get_value('item');
                            if (item) {
                                frappe.call({
                                    method: "frappe.client.get",
                                    args: {
                                        doctype: "Item",
                                        name: item,
                                    },
                                    callback(r) {
                                        if (r.message) {
                                            var itemData = r.message;
                                            d.set_value('item_name', itemData.item_name);
                                        }
                                    }
                                });
                            }
                        }
                    },
                    {
                        label: "Item Name",
                        fieldname: 'item_name',
                        fieldtype: "Data",
                        read_only: true,
                    },
                    {
                        label: 'Quantity',
                        fieldname: 'quantity',
                        fieldtype: 'Int'
                    },
                    {
                        label: 'Finish',
                        fieldname: 'finish',
                        fieldtype: 'Check'
                    },
                    {
                        label: 'Description',
                        fieldname: 'description',
                        fieldtype: 'Small Text'
                    }
                ],
                primary_action_label: 'Submit',
                primary_action: function(values) {
                    d.hide();
                    add_program_item(values);
                }
            });
            d.show();
        });

        function add_program_item(data) {
            frm.add_child('program_items', {
                item_group: data.item_group,
                item: data.item,
                item_name: data.item_name,
                quantity: data.quantity,
                finish: data.finish,
                description: data.description
            })
        }

        frm.add_custom_button(__('Update Item'), function() {
            let program_items = frm.doc.program_items.filter(item => !item.finish);

            if (program_items.length === 0) {
                frappe.msgprint(__('No items available for editing.'));
                return;
            }

            let options = program_items.map(item => ({
                label: item.item_name,
                value: item.name
            }));

            let d = new frappe.ui.Dialog({
                title: "Select and Edit Program Item",
                fields: [
                    {
                        label: 'Program Item',
                        fieldname: 'program_item',
                        fieldtype: 'Select',
                        options: options,
                        onchange: function() {
                            var selected_item = d.get_value('program_item');
                            if (selected_item) {
                                let item = program_items.find(item => item.name === selected_item);
                                d.set_value('quantity', item.quantity);
                                d.set_value('finish', item.finish);
                                d.set_value('description', item.description);
                                d.set_value('item_group', item.item_group);
                                d.set_value('item', item.item);
                                d.set_value('item_name', item.item_name);
                            }
                        }
                    },
                    {
                        label: 'Quantity',
                        fieldname: 'quantity',
                        fieldtype: 'Int'
                    },
                    {
                        label: 'Finish',
                        fieldname: 'finish',
                        fieldtype: 'Check'
                    },
                    {
                        label: 'Description',
                        fieldname: 'description',
                        fieldtype: 'Small Text'
                    },
                    {
                        label: 'Item Group',
                        fieldname: 'item_group',
                        fieldtype: 'Data',
                        read_only: true
                    },
                    {
                        label: 'Item',
                        fieldname: 'item',
                        fieldtype: 'Data',
                        read_only: true
                    },
                    {
                        label: 'Item Name',
                        fieldname: 'item_name',
                        fieldtype: 'Data',
                        read_only: true
                    }
                ],
                primary_action_label: 'Submit',
                primary_action: function(values) {
                    d.hide();
                    update_program_item(values);
                }
            });
            d.show();
        });

        function update_program_item(data) {
            let item_to_update = frm.doc.program_items.find(item => item.name === data.program_item);
        
            if (item_to_update) {
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'item_group', data.item_group);
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'item', data.item);
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'item_name', data.item_name);
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'quantity', data.quantity);
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'finish', data.finish);
                frappe.model.set_value(item_to_update.doctype, item_to_update.name, 'description', data.description);

                frm.refresh_field('program_items');
            } else {
                frappe.msgprint(__('Item not found in the Program Items table.'));
            }
        }
    }
});
