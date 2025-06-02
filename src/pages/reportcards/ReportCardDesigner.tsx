
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AlertCircle, Save, Eye, Plus, Trash2 } from "lucide-react";
import { useUserRole } from "@/hooks/use-user-role";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface ReportCardTemplate {
  id: string;
  name: string;
  template_data: {
    header: {
      school_name: string;
      school_logo: string;
      address: string;
      phone: string;
      email: string;
    };
    layout: {
      show_student_photo: boolean;
      show_class_teacher_comment: boolean;
      show_principal_comment: boolean;
      show_next_term_begins: boolean;
      colors: {
        primary: string;
        secondary: string;
        text: string;
      };
    };
    grading_scale: {
      grade: string;
      min_score: number;
      max_score: number;
      remark: string;
    }[];
    subjects_display: {
      show_ca1: boolean;
      show_ca2: boolean;
      show_exam: boolean;
      show_total: boolean;
      show_grade: boolean;
      show_position: boolean;
    };
  };
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

const defaultTemplate: ReportCardTemplate['template_data'] = {
  header: {
    school_name: "",
    school_logo: "",
    address: "",
    phone: "",
    email: "",
  },
  layout: {
    show_student_photo: true,
    show_class_teacher_comment: true,
    show_principal_comment: true,
    show_next_term_begins: true,
    colors: {
      primary: "#1f2937",
      secondary: "#f3f4f6",
      text: "#374151",
    },
  },
  grading_scale: [
    { grade: "A", min_score: 80, max_score: 100, remark: "Excellent" },
    { grade: "B", min_score: 70, max_score: 79, remark: "Very Good" },
    { grade: "C", min_score: 60, max_score: 69, remark: "Good" },
    { grade: "D", min_score: 50, max_score: 59, remark: "Pass" },
    { grade: "F", min_score: 0, max_score: 49, remark: "Fail" },
  ],
  subjects_display: {
    show_ca1: true,
    show_ca2: true,
    show_exam: true,
    show_total: true,
    show_grade: true,
    show_position: true,
  },
};

export default function ReportCardDesigner() {
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportCardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [templateName, setTemplateName] = useState("");
  const [templateData, setTemplateData] = useState<ReportCardTemplate['template_data']>(defaultTemplate);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (hasPermission("Report Card Management")) {
      fetchTemplates();
    }
  }, [hasPermission]);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("report_card_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Type assertion to ensure proper typing
      const typedTemplates = (data || []).map(template => ({
        ...template,
        template_data: template.template_data as ReportCardTemplate['template_data']
      }));
      
      setTemplates(typedTemplates);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const loadTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(templateId);
      setTemplateName(template.name);
      setTemplateData(template.template_data);
      setIsEditing(true);
    }
  };

  const createNewTemplate = () => {
    setSelectedTemplate("");
    setTemplateName("");
    setTemplateData(defaultTemplate);
    setIsEditing(true);
  };

  const saveTemplate = async () => {
    if (!user || !templateName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a template name",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const templatePayload = {
        name: templateName,
        template_data: templateData,
        created_by: user.id,
        is_default: templates.length === 0, // First template is default
      };

      let error;
      if (selectedTemplate) {
        // Update existing template
        ({ error } = await supabase
          .from("report_card_templates")
          .update(templatePayload)
          .eq("id", selectedTemplate));
      } else {
        // Create new template
        ({ error } = await supabase
          .from("report_card_templates")
          .insert(templatePayload));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: selectedTemplate ? "Template updated successfully" : "Template created successfully",
      });

      await fetchTemplates();
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save template",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from("report_card_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      await fetchTemplates();
      if (selectedTemplate === templateId) {
        setSelectedTemplate("");
        setIsEditing(false);
      }
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const updateHeaderField = (field: keyof ReportCardTemplate['template_data']['header'], value: string) => {
    setTemplateData(prev => ({
      ...prev,
      header: {
        ...prev.header,
        [field]: value,
      },
    }));
  };

  const updateLayoutField = (field: keyof ReportCardTemplate['template_data']['layout'], value: any) => {
    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        [field]: value,
      },
    }));
  };

  const updateColorField = (field: keyof ReportCardTemplate['template_data']['layout']['colors'], value: string) => {
    setTemplateData(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        colors: {
          ...prev.layout.colors,
          [field]: value,
        },
      },
    }));
  };

  const updateSubjectDisplayField = (field: keyof ReportCardTemplate['template_data']['subjects_display'], value: boolean) => {
    setTemplateData(prev => ({
      ...prev,
      subjects_display: {
        ...prev.subjects_display,
        [field]: value,
      },
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Report Card Management")) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-gray-900">Report Card Designer</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-10 gap-4">
            <AlertCircle className="h-16 w-16 text-orange-500" />
            <h2 className="text-xl font-semibold">Access Restricted</h2>
            <p className="text-center text-muted-foreground">
              Only Principals and Exam Officers can design report cards. 
              Please contact your administrator if you need access.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-gray-900">Report Card Designer</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Templates</CardTitle>
              <Button onClick={createNewTemplate} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{template.name}</h4>
                  {template.is_default && (
                    <span className="text-xs text-blue-600">Default</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => loadTemplate(template.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {isEditing ? (selectedTemplate ? "Edit Template" : "New Template") : "Template Designer"}
              </CardTitle>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={saveTemplate} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isEditing ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Select a template to edit or create a new one
                </p>
              </div>
            ) : (
              <>
                {/* Template Name */}
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                  />
                </div>

                {/* Header Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Header Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>School Name</Label>
                      <Input
                        value={templateData.header.school_name}
                        onChange={(e) => updateHeaderField('school_name', e.target.value)}
                        placeholder="School Name"
                      />
                    </div>
                    <div>
                      <Label>School Logo URL</Label>
                      <Input
                        value={templateData.header.school_logo}
                        onChange={(e) => updateHeaderField('school_logo', e.target.value)}
                        placeholder="Logo URL"
                      />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input
                        value={templateData.header.address}
                        onChange={(e) => updateHeaderField('address', e.target.value)}
                        placeholder="School Address"
                      />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input
                        value={templateData.header.phone}
                        onChange={(e) => updateHeaderField('phone', e.target.value)}
                        placeholder="Phone Number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label>Email</Label>
                      <Input
                        value={templateData.header.email}
                        onChange={(e) => updateHeaderField('email', e.target.value)}
                        placeholder="School Email"
                      />
                    </div>
                  </div>
                </div>

                {/* Layout Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Layout Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Show Student Photo</Label>
                      <Switch
                        checked={templateData.layout.show_student_photo}
                        onCheckedChange={(checked) => updateLayoutField('show_student_photo', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Class Teacher Comment</Label>
                      <Switch
                        checked={templateData.layout.show_class_teacher_comment}
                        onCheckedChange={(checked) => updateLayoutField('show_class_teacher_comment', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Principal Comment</Label>
                      <Switch
                        checked={templateData.layout.show_principal_comment}
                        onCheckedChange={(checked) => updateLayoutField('show_principal_comment', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Next Term Begins</Label>
                      <Switch
                        checked={templateData.layout.show_next_term_begins}
                        onCheckedChange={(checked) => updateLayoutField('show_next_term_begins', checked)}
                      />
                    </div>
                  </div>
                </div>

                {/* Color Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Color Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label>Primary Color</Label>
                      <Input
                        type="color"
                        value={templateData.layout.colors.primary}
                        onChange={(e) => updateColorField('primary', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Secondary Color</Label>
                      <Input
                        type="color"
                        value={templateData.layout.colors.secondary}
                        onChange={(e) => updateColorField('secondary', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Text Color</Label>
                      <Input
                        type="color"
                        value={templateData.layout.colors.text}
                        onChange={(e) => updateColorField('text', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Subject Display Settings */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Subject Display Settings</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <Label>Show CA1</Label>
                      <Switch
                        checked={templateData.subjects_display.show_ca1}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_ca1', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show CA2</Label>
                      <Switch
                        checked={templateData.subjects_display.show_ca2}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_ca2', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Exam</Label>
                      <Switch
                        checked={templateData.subjects_display.show_exam}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_exam', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Total</Label>
                      <Switch
                        checked={templateData.subjects_display.show_total}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_total', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Grade</Label>
                      <Switch
                        checked={templateData.subjects_display.show_grade}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_grade', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label>Show Position</Label>
                      <Switch
                        checked={templateData.subjects_display.show_position}
                        onCheckedChange={(checked) => updateSubjectDisplayField('show_position', checked)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
