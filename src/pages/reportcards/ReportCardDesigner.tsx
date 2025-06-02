
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Save, Eye, Plus, Trash2, Copy, FileText } from "lucide-react";
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
        accent: string;
      };
    };
    grading_scale: Array<{
      grade: string;
      min_score: number;
      max_score: number;
      description: string;
    }>;
    subjects_display: {
      show_position: boolean;
      show_grade: boolean;
      show_remarks: boolean;
    };
    footer: {
      signatures: Array<{
        title: string;
        name: string;
      }>;
    };
  };
  is_default: boolean;
  created_at: string;
}

const defaultTemplate = {
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
      secondary: "#6b7280",
      accent: "#10b981",
    },
  },
  grading_scale: [
    { grade: "A+", min_score: 90, max_score: 100, description: "Excellent" },
    { grade: "A", min_score: 80, max_score: 89, description: "Very Good" },
    { grade: "B", min_score: 70, max_score: 79, description: "Good" },
    { grade: "C", min_score: 60, max_score: 69, description: "Fair" },
    { grade: "D", min_score: 50, max_score: 59, description: "Pass" },
    { grade: "E", min_score: 40, max_score: 49, description: "Poor" },
    { grade: "F", min_score: 0, max_score: 39, description: "Fail" },
  ],
  subjects_display: {
    show_position: true,
    show_grade: true,
    show_remarks: true,
  },
  footer: {
    signatures: [
      { title: "Class Teacher", name: "" },
      { title: "Principal", name: "" },
    ],
  },
};

export default function ReportCardDesigner() {
  const { userRole, loading, hasPermission } = useUserRole();
  const { user } = useAuth();
  const [templates, setTemplates] = useState<ReportCardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportCardTemplate | null>(null);
  const [templateName, setTemplateName] = useState("");
  const [templateData, setTemplateData] = useState(defaultTemplate);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    if (hasPermission("Report Card Designer")) {
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
      setTemplates(data || []);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive",
      });
    }
  };

  const saveTemplate = async () => {
    if (!templateName.trim()) {
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
        created_by: user?.id,
        is_default: templates.length === 0, // First template is default
      };

      let result;
      if (selectedTemplate) {
        // Update existing template
        result = await supabase
          .from("report_card_templates")
          .update(templatePayload)
          .eq("id", selectedTemplate.id);
      } else {
        // Create new template
        result = await supabase
          .from("report_card_templates")
          .insert([templatePayload]);
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: selectedTemplate ? "Template updated successfully" : "Template created successfully",
      });

      await fetchTemplates();
      setSelectedTemplate(null);
      setTemplateName("");
      setTemplateData(defaultTemplate);
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

  const loadTemplate = (template: ReportCardTemplate) => {
    setSelectedTemplate(template);
    setTemplateName(template.name);
    setTemplateData(template.template_data);
  };

  const createNewTemplate = () => {
    setSelectedTemplate(null);
    setTemplateName("");
    setTemplateData(defaultTemplate);
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
      if (selectedTemplate?.id === templateId) {
        createNewTemplate();
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

  const duplicateTemplate = (template: ReportCardTemplate) => {
    setSelectedTemplate(null);
    setTemplateName(`${template.name} (Copy)`);
    setTemplateData(template.template_data);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>;
  }

  if (!hasPermission("Report Card Designer")) {
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
        {/* Templates List */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Templates</CardTitle>
              <Button onClick={createNewTemplate} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No templates created yet
              </p>
            ) : (
              templates.map((template) => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => loadTemplate(template)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium">{template.name}</h4>
                      <p className="text-xs text-muted-foreground">
                        {new Date(template.created_at).toLocaleDateString()}
                      </p>
                      {template.is_default && (
                        <Badge className="mt-1" variant="secondary">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          duplicateTemplate(template);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTemplate(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Template Editor */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedTemplate ? "Edit Template" : "Create New Template"}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button onClick={saveTemplate} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
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

            {previewMode ? (
              /* Preview Mode */
              <div className="border rounded-lg p-6 bg-white">
                <div className="space-y-6">
                  {/* Header */}
                  <div className="text-center border-b pb-4">
                    <h2 className="text-2xl font-bold" style={{ color: templateData.layout.colors.primary }}>
                      {templateData.header.school_name || "School Name"}
                    </h2>
                    <p className="text-sm text-gray-600">{templateData.header.address}</p>
                    <p className="text-sm text-gray-600">
                      {templateData.header.phone} | {templateData.header.email}
                    </p>
                  </div>

                  {/* Sample Student Info */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Student Name:</strong> John Doe</p>
                      <p><strong>Class:</strong> SS1A</p>
                      <p><strong>Term:</strong> First Term 2024/2025</p>
                    </div>
                    <div>
                      <p><strong>Student ID:</strong> STU001</p>
                      <p><strong>Total Score:</strong> 850/1000</p>
                      <p><strong>Average:</strong> 85%</p>
                    </div>
                  </div>

                  {/* Sample Subjects Table */}
                  <div className="border rounded">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-2 border-b">Subject</th>
                          <th className="text-center p-2 border-b">Score</th>
                          {templateData.subjects_display.show_grade && (
                            <th className="text-center p-2 border-b">Grade</th>
                          )}
                          {templateData.subjects_display.show_position && (
                            <th className="text-center p-2 border-b">Position</th>
                          )}
                          {templateData.subjects_display.show_remarks && (
                            <th className="text-left p-2 border-b">Remarks</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="p-2 border-b">Mathematics</td>
                          <td className="text-center p-2 border-b">85/100</td>
                          {templateData.subjects_display.show_grade && (
                            <td className="text-center p-2 border-b">A</td>
                          )}
                          {templateData.subjects_display.show_position && (
                            <td className="text-center p-2 border-b">2nd</td>
                          )}
                          {templateData.subjects_display.show_remarks && (
                            <td className="p-2 border-b">Very Good</td>
                          )}
                        </tr>
                        <tr>
                          <td className="p-2 border-b">English</td>
                          <td className="text-center p-2 border-b">78/100</td>
                          {templateData.subjects_display.show_grade && (
                            <td className="text-center p-2 border-b">B</td>
                          )}
                          {templateData.subjects_display.show_position && (
                            <td className="text-center p-2 border-b">5th</td>
                          )}
                          {templateData.subjects_display.show_remarks && (
                            <td className="p-2 border-b">Good</td>
                          )}
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Comments */}
                  {templateData.layout.show_class_teacher_comment && (
                    <div>
                      <strong>Class Teacher's Comment:</strong>
                      <p className="text-sm mt-1">Student shows excellent performance and good behavior.</p>
                    </div>
                  )}

                  {templateData.layout.show_principal_comment && (
                    <div>
                      <strong>Principal's Comment:</strong>
                      <p className="text-sm mt-1">Keep up the good work!</p>
                    </div>
                  )}

                  {/* Signatures */}
                  <div className="grid grid-cols-2 gap-8 mt-8">
                    {templateData.footer.signatures.map((sig, index) => (
                      <div key={index} className="text-center">
                        <div className="border-t border-gray-400 mt-8 pt-2">
                          <p className="font-medium">{sig.title}</p>
                          {sig.name && <p className="text-sm">{sig.name}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <Tabs defaultValue="header" className="w-full">
                <TabsList>
                  <TabsTrigger value="header">Header</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="grading">Grading</TabsTrigger>
                  <TabsTrigger value="footer">Footer</TabsTrigger>
                </TabsList>

                <TabsContent value="header" className="space-y-4">
                  <div>
                    <Label htmlFor="schoolName">School Name</Label>
                    <Input
                      id="schoolName"
                      value={templateData.header.school_name}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        header: { ...prev.header, school_name: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={templateData.header.address}
                      onChange={(e) => setTemplateData(prev => ({
                        ...prev,
                        header: { ...prev.header, address: e.target.value }
                      }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={templateData.header.phone}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          header: { ...prev.header, phone: e.target.value }
                        }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={templateData.header.email}
                        onChange={(e) => setTemplateData(prev => ({
                          ...prev,
                          header: { ...prev.header, email: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="layout" className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="font-medium">Display Options</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.layout.show_student_photo}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            layout: { ...prev.layout, show_student_photo: e.target.checked }
                          }))}
                        />
                        <span>Show Student Photo</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.layout.show_class_teacher_comment}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            layout: { ...prev.layout, show_class_teacher_comment: e.target.checked }
                          }))}
                        />
                        <span>Show Class Teacher Comment</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.layout.show_principal_comment}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            layout: { ...prev.layout, show_principal_comment: e.target.checked }
                          }))}
                        />
                        <span>Show Principal Comment</span>
                      </label>
                    </div>

                    <h4 className="font-medium">Subject Display</h4>
                    <div className="space-y-2">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.subjects_display.show_position}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            subjects_display: { ...prev.subjects_display, show_position: e.target.checked }
                          }))}
                        />
                        <span>Show Position</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.subjects_display.show_grade}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            subjects_display: { ...prev.subjects_display, show_grade: e.target.checked }
                          }))}
                        />
                        <span>Show Grade</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={templateData.subjects_display.show_remarks}
                          onChange={(e) => setTemplateData(prev => ({
                            ...prev,
                            subjects_display: { ...prev.subjects_display, show_remarks: e.target.checked }
                          }))}
                        />
                        <span>Show Remarks</span>
                      </label>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="grading" className="space-y-4">
                  <h4 className="font-medium">Grading Scale</h4>
                  <div className="space-y-2">
                    {templateData.grading_scale.map((grade, index) => (
                      <div key={index} className="grid grid-cols-4 gap-2 items-center">
                        <Input
                          value={grade.grade}
                          onChange={(e) => {
                            const newScale = [...templateData.grading_scale];
                            newScale[index].grade = e.target.value;
                            setTemplateData(prev => ({ ...prev, grading_scale: newScale }));
                          }}
                        />
                        <Input
                          type="number"
                          value={grade.min_score}
                          onChange={(e) => {
                            const newScale = [...templateData.grading_scale];
                            newScale[index].min_score = Number(e.target.value);
                            setTemplateData(prev => ({ ...prev, grading_scale: newScale }));
                          }}
                        />
                        <Input
                          type="number"
                          value={grade.max_score}
                          onChange={(e) => {
                            const newScale = [...templateData.grading_scale];
                            newScale[index].max_score = Number(e.target.value);
                            setTemplateData(prev => ({ ...prev, grading_scale: newScale }));
                          }}
                        />
                        <Input
                          value={grade.description}
                          onChange={(e) => {
                            const newScale = [...templateData.grading_scale];
                            newScale[index].description = e.target.value;
                            setTemplateData(prev => ({ ...prev, grading_scale: newScale }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="footer" className="space-y-4">
                  <h4 className="font-medium">Signatures</h4>
                  <div className="space-y-2">
                    {templateData.footer.signatures.map((sig, index) => (
                      <div key={index} className="grid grid-cols-2 gap-2">
                        <Input
                          placeholder="Title (e.g., Class Teacher)"
                          value={sig.title}
                          onChange={(e) => {
                            const newSigs = [...templateData.footer.signatures];
                            newSigs[index].title = e.target.value;
                            setTemplateData(prev => ({
                              ...prev,
                              footer: { ...prev.footer, signatures: newSigs }
                            }));
                          }}
                        />
                        <Input
                          placeholder="Name (optional)"
                          value={sig.name}
                          onChange={(e) => {
                            const newSigs = [...templateData.footer.signatures];
                            newSigs[index].name = e.target.value;
                            setTemplateData(prev => ({
                              ...prev,
                              footer: { ...prev.footer, signatures: newSigs }
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setTemplateData(prev => ({
                        ...prev,
                        footer: {
                          ...prev.footer,
                          signatures: [...prev.footer.signatures, { title: "", name: "" }]
                        }
                      }));
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Signature
                  </Button>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
